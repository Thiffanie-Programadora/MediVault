export async function getHealth(req, res) {
  res.status(200).json({
    status: 'UP',
    service: 'MediVault Secure Clinical Vault',
    timestamp: new Date().toISOString()
  });
}

export const getHealthStatus = getHealth;
