import HelpOrders from '../models/HelpOrders';
import Student from '../models/Student';

class HelpOrdersController {
  async index(req, res) {
    const student_id = req.params.id;

    const student = await Student.findByPk(student_id);

    if (!student) {
      return res.status(400).json({ erro: 'Estudante não cadastrado.' });
    }

    const answers = await HelpOrders.findAll({
      attributes: ['id', 'student_id', 'question', 'answer', 'answer_at'],
      where: { student_id },
      include: [
        { model: Student, as: 'student', attributes: ['nome', 'email'] },
      ],
    });

    return res.json(answers);
  }

  async store(req, res) {
    const student_id = req.params.id;
    const { question } = req.body;
    const student = await Student.findByPk(student_id);

    if (!student) {
      return res.status(400).json({ erro: 'Estudante não cadastrado.' });
    }

    const helpOrder = await HelpOrders.findOne({
      where: { answer_at: null },
    });

    if (helpOrder) {
      return res
        .status(401)
        .json({ erro: 'Você possui uma pergunta em análise' });
    }

    const { answer, answer_at } = await HelpOrders.create({
      student_id,
      question,
    });

    return res.json({
      student_id,
      question,
      answer,
      answer_at,
    });
  }
}

export default new HelpOrdersController();
