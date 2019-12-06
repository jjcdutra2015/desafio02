import * as Yup from 'yup';
import { startOfWeek, endOfWeek } from 'date-fns';
import { Op } from 'sequelize';

import Checkin from '../models/Checkin';
import Student from '../models/Student';

class CheckinController {
  async index(req, res) {
    const checkins = await Checkin.findAll({
      attributes: ['id', 'created_at'],
      include: [
        {
          model: Student,
          as: 'student',
          attributes: ['id', 'nome', 'email'],
        },
      ],
    });

    return res.json(checkins);
  }

  async store(req, res) {
    const student_id = req.params.id;

    const student = await Student.findByPk(student_id);

    if (!student) {
      return res.status(400).json({ erro: 'Estudante não existe.' });
    }

    const dateNow = new Date();

    const chkWeek = await Checkin.findAll({
      where: {
        student_id,
        created_at: {
          [Op.between]: [startOfWeek(dateNow), endOfWeek(dateNow)],
        },
      },
    });

    if (chkWeek.length >= 5) {
      return res.status(400).json({ erro: 'Limite de 5 chekins por semana' });
    }

    await Checkin.create({ student_id });

    return res.json({ msg: 'Checkin criado com sucesso.' });
  }
}

export default new CheckinController();
