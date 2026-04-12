module.exports = (req, res) => {
  if (req.method === 'POST') {
    return res.status(200).json({ 
      status: 'success', 
      message: 'Pago procesado correctamente (Simulado)',
      transactionId: 'TX-' + Math.floor(Math.random() * 1000000)
    });
  }
  return res.status(405).json({ message: 'Método no permitido' });
};
