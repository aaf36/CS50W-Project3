document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', function() {
    load_mailbox('inbox');
    get_mail('inbox');
  });
  document.querySelector('#sent').addEventListener('click', function() {
    load_mailbox('sent');
    get_mail('sent');
  });
  document.querySelector('#archived').addEventListener('click', function() {
    load_mailbox('archive');
    get_mail('archive');
  });
  document.querySelector('#compose').addEventListener('click', compose_email);

  // function to send email
  document.querySelector('#compose-form').addEventListener('submit', send_email);
  
  // By default, load the inbox
  load_mailbox('inbox');
});

function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
}

function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;
}

function send_email(event){
  event.preventDefault();

  // store values from compose form
  const recipients = document.querySelector('#compose-recipients').value;
  const subject = document.querySelector('#compose-subject').value;
  const body = document.querySelector('#compose-body').value;

  // use POST method on API url 
  fetch('/emails', {
    method: 'POST',
    body: JSON.stringify({
        recipients: recipients,
        subject: subject,
        body: body
    })
  })
  .then(response => response.json())
  .then(result => {
      console.log(result);
      load_mailbox('sent');
  });
}

// function to retrieve mail
function get_mail(mailbox){
  fetch('/emails/'+mailbox)
  .then(response => response.json())
  .then(emails => {
      // Print emails
      console.log(emails);
      // loop over each email and add them as divs to the mailbox
      for (let i = 0; i < emails.length; i++) {
        let email_sender = JSON.stringify(emails[i].sender);
        let email_subject = JSON.stringify(emails[i].subject);
        let email_timestamp = JSON.stringify(emails[i].timestamp);
      
        let email_div = document.createElement('div');
        email_div.textContent = `Sender: ${email_sender}, Subject: ${email_subject}, Timestamp: ${email_timestamp}`;
        email_div.style.border = 'solid';

        if(emails[i].read===true){
          email_div.style.backgroundColor = '#D3D3D3';
        }
        
        let emails_view = document.getElementById('emails-view');
        emails_view.appendChild(email_div);
      }
      
  });
}