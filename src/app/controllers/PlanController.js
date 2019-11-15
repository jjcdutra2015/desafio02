import * as Yup from 'yup';

import Plan from '../models/Plan';
import User from '../models/User';

class PlanController {
  async index(req, res) {
    const admin = await User.findOne({
      where: { id: req.userId, name: 'Administrador' },
    });

    if (!admin) {
      return res
        .status(401)
        .json({ erro: 'Somente administrador pode listar planos' });
    }

    const { page = 1 } = req.query;

    const plans = await Plan.findAll({
      where: { canceled_at: null },
      attributes: ['id', 'title', 'duration', 'price'],
      offset: (page - 1) * 20,
    });

    return res.json(plans);
  }

  async store(req, res) {
    const admin = await User.findOne({
      where: { id: req.userId, name: 'Administrador' },
    });

    if (!admin) {
      return res
        .status(401)
        .json({ erro: 'Somente administrador pode listar planos' });
    }

    const schema = Yup.object().shape({
      title: Yup.string().required(),
      duration: Yup.number().required(),
      price: Yup.number().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ erro: 'Falha de validação.' });
    }

    const existPlan = await Plan.findOne({
      where: { title: req.body.title },
    });

    if (existPlan) {
      return res.status(400).json({ erro: 'Plano já cadastrado.' });
    }

    const { id, title, duration, price } = await Plan.create(req.body);

    return res.json({
      id,
      title,
      duration,
      price,
    });
  }

  async update(req, res) {
    const admin = await User.findOne({
      where: { id: req.userId, name: 'Administrador' },
    });

    if (!admin) {
      return res
        .status(401)
        .json({ erro: 'Somente administrador pode listar planos' });
    }

    const schema = Yup.object().shape({
      title: Yup.string(),
      duration: Yup.number(),
      price: Yup.number(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ erro: 'Falha de validação.' });
    }

    const { id } = req.params;
    const { title } = req.body;

    const plan = await Plan.findByPk(id);

    if (title !== plan.title) {
      const existPlans = await Plan.findOne({ where: { title } });

      if (existPlans) {
        return res.status(400).json({ erro: 'Título já existe.' });
      }
    }

    const { duration, price } = await plan.update(req.body);

    return res.json({
      id,
      title,
      duration,
      price,
    });
  }

  async delete(req, res) {
    const admin = await User.findOne({
      where: { id: req.userId, name: 'Administrador' },
    });

    if (!admin) {
      return res
        .status(401)
        .json({ erro: 'Somente administrador pode listar planos' });
    }

    const plan = await Plan.findByPk(req.params.id);

    if (!plan) {
      return res.status(400).json({ erro: 'Plano não existe!' });
    }

    // plan.canceled_at = new Date();

    await plan.destroy();

    return res.json();
  }
}

export default new PlanController();
