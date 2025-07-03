const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');
const otpGenerator = require('otp-generator');

router.post('/sendMail',async (req, res) => {
    if(req.body.gmail == undefined){
        return res.status(300).json({   status:false, message: 'gmail must be provided' }); 
    }

    else if(typeof req.body.gmail !== 'string'){
        return res.status(300).json({   status:false, message: 'gmail must be string' });
    }

    if(req.body.name == undefined){
        return res.status(300).json({   status:false, message: 'name must be provided' }); 
    }

    else if(typeof req.body.name !== 'string'){
        return res.status(300).json({   status:false, message: 'name must be string' });
    }

    if(req.body.subject == undefined){
        return res.status(300).json({   status:false, message: 'subject must be provided' }); 
    }

    else if(typeof req.body.subject !== 'string'){
        return res.status(300).json({   status:false, message: 'subject must be string' });
    }

    if(req.body.message == undefined){
        return res.status(300).json({   status:false, message: 'message must be provided' }); 
    }

    else if(typeof req.body.message !== 'string'){
        return res.status(300).json({   status:false, message: 'message must be string' });
    }

    
    const  expectedKeys = ["gmail","message","subject","name"];
    // Check for extra fieldssubject
    const extraFields = Object.keys(req.body).filter(key => !expectedKeys.includes(key));


    if (extraFields.length > 0) {
        return res.status(300).json({
            status:false,
            msg: 'Invalid fields: ' + extraFields.join(', ') 
        });
    }

    
try{ 

    await sendMail(req,res);
          
  
    } catch (err) {
      res.status(500).json({
          status:false,
          message: 'Something went wrong', 
          error:err
      });
  }
});



  async function sendMail(req,res){

  const appName = "Portfolio";
  const companyMail = `agraharitrial@gmail.com`;
  const companyIcon = "";
  const gmail = req.body.gmail;
  const subject = req.body.subject;
  const message = req.body.message;
  const name = req.body.name;


  // Configure email data
  const mailOptions = {
    from: gmail,
    to: companyMail,
    subject: subject,
    html: `
    <div style="background-color: #f0f0f0; padding: 10px; border-radius: 5px; color: black; text-align: center;">
    <div style="display: inline-block; vertical-align: top;">
    <h1>${appName}</h1>
    </div>
    </div>
    <h2>From : ${gmail}</h2>
    <h2>Name : ${name}</h2>
    <h3>${message}</h3>`,
  };

  // Send the email
  await transporter.sendMail(mailOptions, (error) => {
    if (error) {
      return res.status(400).json({ 
          status: false,
          message: 'Error sending Mail',
          });
    }
    else{
        return res.status(400).json({ 
            status: true,
            message: 'Sending mail successfully',
            });
    }
  });
  }


// Configure nodemailer to send emails (replace with your email provider settings)
const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
      user: 'agraharitrial@gmail.com',
      pass: 'otis jzrv wjoo mfrx',
    },
  });


module.exports = router;