import { isBefore, parseISO } from 'date-fns';
import Meetup from '../models/Meetup';

class MeetupController {
  async index(req, res) {
    const meetups = await Meetup.findAll({
      where: {
        user_id: req.userId,
      },
    });

    res.json(meetups);
  }

  async store(req, res) {
    const { id, title, description, locale, date, banner_id } = req.body;

    const dateIsValid = isBefore(parseISO(date), new Date());

    if (dateIsValid) {
      return res.status(401).json({ error: 'This date already past.' });
    }

    const meetup = {
      id,
      title,
      description,
      locale,
      date,
      user_id: req.userId,
      banner_id,
    };

    await Meetup.create(meetup);

    return res.json(meetup);
  }

  async update(req, res) {
    const meetup = await Meetup.findByPk(req.params.id);

    if (!meetup) {
      return res.json({ error: 'Meetup not found.' });
    }

    const dateIsValid = isBefore(parseISO(meetup.date), new Date());

    if (!(meetup.user_id === req.userId)) {
      return res.status(401).json({ error: "You can't update this meetup." });
    }

    if (dateIsValid) {
      return res.status(401).json({ error: 'This date already past.' });
    }

    const newDateIsValid = isBefore(parseISO(req.body.date), new Date());

    if (newDateIsValid) {
      return res.status(401).json({ error: 'This date already past.' });
    }

    const {
      id,
      title,
      description,
      locale,
      date,
      banner_id,
    } = await meetup.update(req.body);

    return res.json({
      id,
      title,
      description,
      locale,
      date,
      banner_id,
    });
  }

  async delete(req, res) {
    const meetup = await Meetup.findByPk(req.params.id);

    if (!meetup) {
      return res.json({ error: 'Meetup not found.' });
    }

    if (!(meetup.user_id === req.userId)) {
      return res.status(401).json({ error: "You can't delete this meetup." });
    }

    const dateIsValid = isBefore(meetup.date, new Date());

    if (dateIsValid) {
      return res.status(401).json({ error: 'This date already past.' });
    }

    await meetup.destroy(meetup);

    return res.json({
      message: `Meetup ${meetup.id} - ${meetup.title} was deleted.`,
    });
  }
}

export default new MeetupController();
