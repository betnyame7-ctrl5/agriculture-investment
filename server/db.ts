import Database from 'better-sqlite3';
import bcrypt from 'bcryptjs';
import path from 'path';
import fs from 'fs';

const dbPath = path.resolve(process.cwd(), 'agriculture.db');
const db = new Database(dbPath);

// Enable WAL mode for high concurrency
db.pragma('journal_mode = WAL');

// Initialize Database Schema
export function initDb() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS profiles (
      id TEXT PRIMARY KEY,
      full_name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT DEFAULT 'user',
      balance REAL DEFAULT 0.0,
      is_verified INTEGER DEFAULT 0,
      is_suspended INTEGER DEFAULT 0,
      verification_code TEXT,
      verification_expires TEXT,
      reset_code TEXT,
      reset_expires TEXT,
      phone TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS investment_packages (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      animal_type TEXT NOT NULL,
      contribution_amount REAL NOT NULL,
      duration_hours INTEGER DEFAULT 24,
      projected_return_min REAL NOT NULL,
      projected_return_max REAL NOT NULL,
      description TEXT NOT NULL,
      business_activity TEXT NOT NULL,
      risk_factors TEXT NOT NULL,
      image_url TEXT NOT NULL,
      is_active INTEGER DEFAULT 1,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS investments (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      package_id TEXT NOT NULL,
      package_name TEXT NOT NULL,
      contribution_amount REAL NOT NULL,
      projected_return REAL NOT NULL,
      actual_return REAL DEFAULT 0.0,
      duration_hours INTEGER DEFAULT 24,
      start_time TEXT NOT NULL,
      maturity_time TEXT NOT NULL,
      status TEXT DEFAULT 'active',
      business_yield_notes TEXT,
      completed_at TEXT,
      created_at TEXT NOT NULL,
      FOREIGN KEY(user_id) REFERENCES profiles(id),
      FOREIGN KEY(package_id) REFERENCES investment_packages(id)
    );

    CREATE TABLE IF NOT EXISTS deposits (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      amount REAL NOT NULL,
      network TEXT NOT NULL,
      mobile_number TEXT NOT NULL,
      account_name TEXT NOT NULL,
      transaction_reference TEXT UNIQUE NOT NULL,
      proof_image_url TEXT,
      status TEXT DEFAULT 'pending',
      admin_notes TEXT,
      processed_by TEXT,
      processed_at TEXT,
      created_at TEXT NOT NULL,
      FOREIGN KEY(user_id) REFERENCES profiles(id)
    );

    CREATE TABLE IF NOT EXISTS withdrawals (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      amount REAL NOT NULL,
      network TEXT NOT NULL,
      mobile_number TEXT NOT NULL,
      account_holder_name TEXT NOT NULL,
      status TEXT DEFAULT 'pending',
      payment_reference TEXT,
      decline_reason TEXT,
      processed_by TEXT,
      processed_at TEXT,
      created_at TEXT NOT NULL,
      FOREIGN KEY(user_id) REFERENCES profiles(id)
    );

    CREATE TABLE IF NOT EXISTS transactions (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      type TEXT NOT NULL,
      amount REAL NOT NULL,
      balance_before REAL NOT NULL,
      balance_after REAL NOT NULL,
      reference_id TEXT,
      description TEXT NOT NULL,
      created_at TEXT NOT NULL,
      FOREIGN KEY(user_id) REFERENCES profiles(id)
    );

    CREATE TABLE IF NOT EXISTS notifications (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      title TEXT NOT NULL,
      message TEXT NOT NULL,
      type TEXT NOT NULL,
      is_read INTEGER DEFAULT 0,
      created_at TEXT NOT NULL,
      FOREIGN KEY(user_id) REFERENCES profiles(id)
    );

    CREATE TABLE IF NOT EXISTS support_messages (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      sender_role TEXT NOT NULL,
      sender_name TEXT NOT NULL,
      message TEXT NOT NULL,
      is_read INTEGER DEFAULT 0,
      is_resolved INTEGER DEFAULT 0,
      created_at TEXT NOT NULL,
      FOREIGN KEY(user_id) REFERENCES profiles(id)
    );

    CREATE TABLE IF NOT EXISTS site_settings (
      id TEXT PRIMARY KEY,
      momo_network TEXT NOT NULL DEFAULT 'TELECEL',
      momo_number TEXT NOT NULL DEFAULT '0507399029',
      momo_account_name TEXT NOT NULL DEFAULT 'JOYCE ASABEA',
      min_deposit REAL NOT NULL DEFAULT 10.0,
      min_withdrawal REAL NOT NULL DEFAULT 10.0,
      contact_email TEXT NOT NULL DEFAULT 'support@agricultureinvestment.com',
      contact_phone TEXT NOT NULL DEFAULT '+233 50 739 9029',
      contact_address TEXT NOT NULL DEFAULT 'Agro-Hub Complex, Sunyani Road, Kumasi, Ghana',
      business_disclosure TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS email_logs (
      id TEXT PRIMARY KEY,
      recipient_email TEXT NOT NULL,
      subject TEXT NOT NULL,
      code TEXT NOT NULL,
      body TEXT NOT NULL,
      created_at TEXT NOT NULL
    );
  `);

  // Seed default site settings if not present
  const existingSettings = db.prepare('SELECT id FROM site_settings WHERE id = ?').get('default');
  if (!existingSettings) {
    db.prepare(`
      INSERT INTO site_settings (
        id, momo_network, momo_number, momo_account_name, min_deposit, min_withdrawal,
        contact_email, contact_phone, contact_address, business_disclosure, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      'default',
      'TELECEL',
      '0507399029',
      'JOYCE ASABEA',
      10.0,
      10.0,
      'support@agricultureinvestment.com',
      '+233 50 739 9029',
      'Agro-Hub Complex, Sunyani Road, Kumasi, Ghana',
      'Agriculture Investment operates physical livestock farming, breeding, veterinary disease prevention, and wholesale distribution cooperatives in Ghana. All financial contributions go directly toward livestock feeds, health vaccines, shelter infrastructure, and ethical husbandry. Projected returns are estimates derived from historical agricultural market sales and wholesale meat/egg distribution, not guaranteed promises.',
      new Date().toISOString()
    );
  }

  // Seed standard packages if empty
  const packageCount = db.prepare('SELECT COUNT(*) as count FROM investment_packages').get() as { count: number };
  if (packageCount.count === 0) {
    const packages = [
      {
        id: 'pkg_dog_15',
        name: 'DOG PACKAGE',
        animal_type: 'Farm Canine & Boerboel Security',
        contribution_amount: 15.0,
        duration_hours: 24,
        projected_return_min: 1.2,
        projected_return_max: 2.25,
        description: 'Supports high-grade farm guardian dog feeds, puppy weaning nutrition, and certified Boerboel security breeding. Dogs protect commercial livestock herds against farm predators and guard rural agro-storage facilities.',
        business_activity: 'Nutritional feeds, puppy vaccination, training for commercial ranch security, and scheduled canine guard lease contracts.',
        risk_factors: 'Veterinary health volatility, whelping complications, and market feed price fluctuations. Managed via strict biosecurity protocols.',
        image_url: 'https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=800&q=80',
        is_active: 1,
        created_at: new Date().toISOString()
      },
      {
        id: 'pkg_goat_40',
        name: 'GOAT PACKAGE',
        animal_type: 'Boer & Sahelian Livestock',
        contribution_amount: 40.0,
        duration_hours: 24,
        projected_return_min: 3.5,
        projected_return_max: 6.0,
        description: 'Funds sustainable goat fattening, protein silage, and disease deworming across our regional agro-pasture pens. Goats mature rapidly with steady demand in urban butcheries and culinary markets.',
        business_activity: 'Silage foraging, automated water troughs, routine veterinary checks, and wholesale abattoir supply agreements.',
        risk_factors: 'Peste des petits ruminants (PPR) risks mitigated by mandatory vaccination and quarantine holding pens.',
        image_url: 'https://images.unsplash.com/photo-1524024973431-2ad916746881?auto=format&fit=crop&w=800&q=80',
        is_active: 1,
        created_at: new Date().toISOString()
      },
      {
        id: 'pkg_cow_80',
        name: 'COW PACKAGE',
        animal_type: 'Sanga & White Fulani Cattle',
        contribution_amount: 80.0,
        duration_hours: 24,
        projected_return_min: 7.2,
        projected_return_max: 12.8,
        description: 'Powers large-scale cattle fattening, high-protein legume grazing pastures, mineral licks, and certified dairy/beef cooperative supply chains across Ghanaian commercial ranches.',
        business_activity: 'Feedlot rotational grazing, organic mineral supplementation, veterinary certified health logs, and bulk wholesale beef distribution.',
        risk_factors: 'Seasonal forage availability and transport logistics. Controlled via dedicated hay reserves and contracted refrigerated logistics.',
        image_url: 'https://images.unsplash.com/photo-1570042225831-d98fa7577f1e?auto=format&fit=crop&w=800&q=80',
        is_active: 1,
        created_at: new Date().toISOString()
      }
    ];

    const insertPkg = db.prepare(`
      INSERT INTO investment_packages (
        id, name, animal_type, contribution_amount, duration_hours,
        projected_return_min, projected_return_max, description, business_activity,
        risk_factors, image_url, is_active, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    for (const p of packages) {
      insertPkg.run(
        p.id, p.name, p.animal_type, p.contribution_amount, p.duration_hours,
        p.projected_return_min, p.projected_return_max, p.description, p.business_activity,
        p.risk_factors, p.image_url, p.is_active, p.created_at
      );
    }
  }

  // Seed Admin Account if not present
  const adminEmail = 'admin@agricultureinvestment.com';
  const existingAdmin = db.prepare('SELECT id FROM profiles WHERE email = ?').get(adminEmail);
  if (!existingAdmin) {
    const salt = bcrypt.genSaltSync(10);
    const passwordHash = bcrypt.hashSync('AdminAgro2026!', salt);
    db.prepare(`
      INSERT INTO profiles (
        id, full_name, email, password_hash, role, balance, is_verified, is_suspended, phone, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      'admin_master_001',
      'System Administrator',
      adminEmail,
      passwordHash,
      'admin',
      0.0,
      1,
      0,
      '+233 50 739 9029',
      new Date().toISOString(),
      new Date().toISOString()
    );
  }
}

export default db;
