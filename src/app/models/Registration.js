import Sequelize, { Model } from 'sequelize';

class Registration extends Model {
  static init(sequelize) {
    super.init(
      {
        meetup_id: Sequelize.INTEGER,
        user_id: Sequelize.INTEGER,
      },
      {
        sequelize,
      }
    );

    return this;
  }

  // static associate(models) {
  //   this.belongsTo(models.Meetup, { foreingKey: 'meetup_id', as: 'meetup' });
  //   this.belongsTo(models.User, { foreingKey: 'user_id', as: 'user' });
  // }
}

export default Registration;
