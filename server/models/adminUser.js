import bcrypt from 'bcryptjs';

class AdminUser {
  constructor(username, password) {
    this.username = username;
    this.password = password;
  }

  static async hashPassword(password) {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
  }

  static async comparePassword(password, hashedPassword) {
    return bcrypt.compare(password, hashedPassword);
  }
}

export default AdminUser;
