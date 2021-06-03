// to read environment variables
const dotenv = require('dotenv');

// to make get requests
const https = require('https');

// for emails
const nodemailer = require('nodemailer');

dotenv.config();

const transporter = nodemailer.createTransport({
  service: process.env.FROM_EMAIL_SERVICE,
  auth: {
    user: process.env.FROM_EMAIL,
    pass: process.env.FROM_EMAIL_PWD
  }
});

var requestLoop = setInterval(() => {

  console.log('Making request');

  let data = '';
  https.get('https://www.doctolib.de/availabilities.json?start_date=2021-05-28&visit_motive_ids=2772915&agenda_ids=456933&insurance_sector=public&practice_ids=16818&destroy_temporary=true&limit=4', (resp) => {

    // A chunk of data has been received.
    resp.on('data', (chunk) => {
      data += chunk;
    });

    // Convert to json on end
    resp.on('end', () => {
      data = JSON.parse(data);

      const total = data.total;
      const availabilities = data.availabilities;

      // if availabilities exist, send the information to the email

      if( total > 0 ) {

        console.log('Slots available, sending email');

        var mailOptions = {
          from: process.env.FROM_EMAIL,
          subject: `${total} VACCINE SLOT(S) AVAILABLE!`,
          text: `
            Vaccine slot(s) are available
            The following is the vaccine availibility array:
            ${JSON.stringify(availabilities)}
          `
        };
        
        if(process.env.TO_EMAIL_1) {

          var mailOptions1 = {
            ...mailOptions,
            to: process.env.TO_EMAIL_1,
          }

          transporter.sendMail(mailOptions1, function(error, info){
            if (error) {
              console.log(error);
            } else {
              console.log('Email sent: ' + info.response);
            }
          });
        }

        if(process.env.TO_EMAIL_2) {

          var mailOptions2 = {
            ...mailOptions,
            to: process.env.TO_EMAIL_2,
          }

          transporter.sendMail(mailOptions2, function(error, info){
            if (error) {
              console.log(error);
            } else {
              console.log('Email sent: ' + info.response);
            }
          });
        }
    
      }
    });

  }).on("error", (err) => {
    console.log("Error: " + err.message);
  });

}, process.env.INTERVAL);
