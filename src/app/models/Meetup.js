import Sequelize, { Model } from 'sequelize';

class Meetup extends Model {
  static init(sequelize) {
    super.init(
      {
        title: Sequelize.STRING,
        description: Sequelize.STRING,
        locale: Sequelize.STRING,
        date: Sequelize.DATE,
      },
      {
        sequelize,
      }
    );

    return this;
  }

  static associate(models) {
    this.belongsTo(models.File, { foreingKey: 'banner_id', as: 'banner' });
    this.belongsTo(models.User, { foreingKey: 'user_id', as: 'user' });
  }
}

export default Meetup;
