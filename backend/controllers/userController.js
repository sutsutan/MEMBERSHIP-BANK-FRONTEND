const supabase = require('../db/index');

// GET
exports.getUsers = async (req, res) => {
  try {
    const { data, error } = await supabase.from('anggota').select('*');
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// POST
exports.createUser = async (req, res) => {
  try {
    const { name, email } = req.body;
    const { data, error } = await supabase.from('anggota').insert([{ name, email }]).select();
    if (error) throw error;
    res.status(201).json(data[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// PUT
exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email } = req.body;
    const { data, error } = await supabase.from('anggota').update({ name, email }).eq('id', id).select();
    if (error) throw error;
    res.json(data[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// DELETE
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { error } = await supabase.from('anggota').delete().eq('id', id);
    if (error) throw error;
    res.json({ message: `User ${id} berhasil dihapus` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
