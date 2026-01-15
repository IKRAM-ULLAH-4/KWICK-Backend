import Step from "../models/Step.model.js";

export const getSteps = async (req, res) => {
  try {
    const steps = await Step.find().sort({ number: 1 });
    res.json(steps);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const createStep = async (req, res) => {
  try {
    const step = new Step(req.body);
    await step.save();
    res.json({ message: "Step created", step });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const updateStep = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await Step.findByIdAndUpdate(id, req.body, { new: true });
    res.json({ message: "Step updated", updated });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const deleteStep = async (req, res) => {
  try {
    const { id } = req.params;
    await Step.findByIdAndDelete(id);
    res.json({ message: "Step deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
