import HelpOrders from '../models/HelpOrders';
import Student from '../models/Student';
import Mail from '../../lib/Mail';

class GymController {
  async index(req, res) {
    const helpOrders = await HelpOrders.findAll({
      where: { answer_at: null },
    });

    res.json(helpOrders);
  }

  async store(req, res) {
    const student_id = req.params.id;
    const { answer } = req.body;

    const student = await Student.findByPk(student_id);
    if (!student) {
      return res.status(400).json({ erro: 'Estudante não cadastrado.' });
    }

    const helpOrder = await HelpOrders.findOne({
      where: { student_id, answer_at: null },
    });

    helpOrder.answer = answer;
    helpOrder.answer_at = new Date();

    await helpOrder.save();

    await Mail.sendMail({
      to: `${student.nome} <${student.email}>`,
      subject: 'Resposta GymPoint',
      text: `
        Pergunta(Aluno): ${helpOrder.question},
        Resposta(Academia): ${helpOrder.answer}
      `,
    });

    return res.json({ msg: 'Resposta adicionada com sucesso.' });
  }
}

export default new GymController();
