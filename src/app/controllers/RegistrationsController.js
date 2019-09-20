import { isBefore, format } from 'date-fns';
import { Op } from 'sequelize';

import Mail from '../../lib/Mail';

import User from '../models/User';
import Meetup from '../models/Meetup';
import Registrations from '../models/Registration';

class RegistrationsController {
  async index(req, res) {
    return res.json({ index: true });
  }

  async store(req, res) {
    // const meetup = await Meetup.findByPk(req.params.meetup_id);

    const meetup = await Meetup.findOne({
      where: { id: req.params.meetup_id },
      attributes: ['id', 'title', 'date', 'userId', 'bannerId'],
      include: {
        model: User,
        as: 'user',
        attributes: ['name', 'email'],
      },
    });

    if (!meetup) {
      return res.json({ error: 'Meetup not found.' });
    }

    if (meetup.userId === req.userId) {
      res.status(401).json({ error: 'You are the organizer this meetup.' });
    }
    const dateIsValid = isBefore(meetup.date, new Date());

    if (dateIsValid) {
      return res.status(401).json({ error: 'This meetup already past.' });
    }

    const alreadyRegistered = await Registrations.findOne({
      where: {
        meetup_id: req.params.meetup_id,
        user_id: req.userId,
      },
    });

    if (alreadyRegistered) {
      return res.status(401).json({ error: 'You alredy registered' });
    }

    const meetups = await Registrations.findAll({
      where: {
        user_id: req.userId,
      },
    });

    if (meetups.length > 0) {
      const registrationsIds = meetups.map(mup => mup.meetup_id);

      const meetupsRegistered = await Meetup.findOne({
        where: {
          id: registrationsIds,
          date: {
            [Op.between]: [
              format(meetup.date, "yyyy-MM-dd'T'HH:00:00xxx"),
              format(meetup.date, "yyyy-MM-dd'T'HH:59:59xxx"),
            ],
          },
        },
      });

      if (meetupsRegistered) {
        return res
          .status(401)
          .json({ error: `You're already registered in a meetup this hour.` });
      }
    }

    // await Registrations.create({
    //   meetup_id: req.params.meetup_id,
    //   user_id: req.userId,
    // });

    const registeredUser = await User.findByPk(req.userId);

    await Mail.sendMail({
      to: `${meetup.user.name} <${meetup.user.email}>`,
      to: `${registeredUser.name} <${registeredUser.email}>`,
      subject: 'Subscription meetup.',
      text: `
      Dear ${meetup.user.name},

      The user ${registeredUser.name}, subscription in your meetup ${meetup.title}.`,
    });

    // return res.json({
    //   meetup_title: meetup.title,
    //   date: meetup.date,
    //   message: 'Registration success',
    // });

    return res.json(meetup);
  }
}

export default new RegistrationsController();
