module.exports = (amount, usdValue, txHash) => `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
    <h2 style="color: #52AAC5; text-align: center;">Deposit Received</h2>
    <p style="text-align: center;">Thank you for your deposit. Here are the details:</p>
    
    <div style="background-color: #f9f9f9; padding: 15px; border-radius: 6px; margin: 20px 0;">
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 8px; border-bottom: 1px solid #e0e0e0; font-weight: bold;">Amount (SOL):</td>
          <td style="padding: 8px; border-bottom: 1px solid #e0e0e0;">${amount} SOL</td>
        </tr>
        <tr>
          <td style="padding: 8px; border-bottom: 1px solid #e0e0e0; font-weight: bold;">Amount (USD):</td>
          <td style="padding: 8px; border-bottom: 1px solid #e0e0e0;">$${usdValue}</td>
        </tr>
        <tr>
          <td style="padding: 8px; font-weight: bold;">Transaction Hash:</td>
          <td style="padding: 8px;">${txHash}</td>
        </tr>
      </table>
    </div>
    
    <p style="font-size: 14px; color: #666; text-align: center;">
      Your funds will be available in your account once the transaction is confirmed on the blockchain.
    </p>
    
    <div style="margin-top: 30px; text-align: center; font-size: 12px; color: #999;">
      <p>If you didn't initiate this deposit, please contact support immediately.</p>
      <p>Best regards,<br>Crypto Wallet Team</p>
    </div>
  </div>
`;
