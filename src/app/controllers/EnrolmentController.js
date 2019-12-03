import * as Yup from 'yup';
import { parseISO, addMonths, isAfter } from 'date-fns';

import Enrolment from '../models/Enrolment';
import Plan from '../models/Plan';
import Student from '../models/Student';
import User from '../models/User';
import Mail from '../../lib/Mail';

class EnrolmentController {
  async index(req, res) {
    const { page = 1 } = req.query;

    const admin = await User.findOne({
      where: { id: req.userId, name: 'Administrador' },
    });

    if (!admin) {
      return res
        .status(401)
        .json({ erro: 'Somente administrado pode listar matrículas.' });
    }

    const enrolment = await Enrolment.findAll({
      limit: 20,
      offset: (page - 1) * 20,
      attributes: ['id', 'start_date', 'end_date', 'price'],
      include: [
        {
          model: Student,
          as: 'student',
          attributes: ['nome', 'email'],
        },
        {
          model: Plan,
          as: 'plan',
          attributes: ['title', 'duration'],
        },
      ],
    });

    return res.json(enrolment);
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      student_id: Yup.number().required(),
      plan_id: Yup.number().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ erro: 'Falha na validação' });
    }

    const admin = await User.findOne({
      where: { id: req.userId, name: 'Administrador' },
    });

    if (!admin) {
      return res
        .status(401)
        .json({ erro: 'Somente administrador pode criar matrículas' });
    }

    const { student_id, plan_id, start_date } = req.body;

    const student = await Student.findByPk(student_id);

    if (!student) {
      return res.status(400).json({ erro: 'Estudante não encontrado.' });
    }

    const plan = await Plan.findByPk(plan_id);

    if (!plan) {
      return res.status(400).json({ erro: 'Plano não encontrado.' });
    }

    const end_date = addMonths(parseISO(start_date), plan.duration);
    const price = plan.duration * plan.price;

    await Enrolment.create({
      student_id,
      plan_id,
      start_date,
      end_date,
      price,
    });

    await Mail.sendMail({
      to: `${student.nome} <${student.email}>`,
      subject: 'Matrícula GymPoint',
      text: `
        Plano: ${plan.title}
        Duração: ${plan.duration}
        Valor: ${price}
        Término: ${end_date}
      `,
    });

    return res.json({ student_id, plan_id, start_date, end_date, price });
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      plan_id: Yup.number().required(),
      start_date: Yup.date().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ erro: 'Falha na validação.' });
    }

    const admin = await User.findOne({
      where: { id: req.userId, name: 'Administrador' },
    });

    if (!admin) {
      return res
        .status(401)
        .json({ erro: 'Somente administrado pode listar matrículas.' });
    }

    const { id } = req.params;
    const { plan_id, start_date } = req.body;

    const enrolment = await Enrolment.findByPk(id);

    if (!enrolment) {
      return res.status(400).json({ erro: 'Matrícula não exite.' });
    }

    const plan = await Plan.findByPk(plan_id);
    if (!plan) {
      return res.status(400).json({ erro: 'Plano não existe.' });
    }

    // if (isAfter(enrolment.end_date, new Date())) {
    //   return res.status(401).json({ erro: 'Plano em data de validade.' });
    // }

    const end_date = addMonths(parseISO(start_date), plan.duration);
    const price = plan.duration * plan.price;

    const { student_id } = await enrolment.update({ plan_id, end_date, price });

    return res.json({ id, student_id, plan_id, start_date });
  }

  async delete(req, res) {
    const admin = await User.findOne({
      where: { id: req.userId, name: 'Administrador' },
    });

    if (!admin) {
      return res
        .status(401)
        .json({ erro: 'Somente administrado pode listar matrículas.' });
    }

    const { id } = req.params;

    const enrolment = await Enrolment.findByPk(id);

    if (!enrolment) {
      return res.status(400).json({ erro: 'Matrícula não existe.' });
    }

    await enrolment.destroy();

    return res.json();
  }
}

export default new EnrolmentController();
