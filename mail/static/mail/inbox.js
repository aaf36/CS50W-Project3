document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);

  // function to send email
  document.querySelector('#compose-form').addEventListener('submit', send_email);
  
  // By default, load the inbox
  load_mailbox('inbox');
});

function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#email-view').style.display = 'none';
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
  document.querySelector('#email-view').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

     fetch(`/emails/${mailbox}`)
    .then(response => response.json())
    .then(emails => {
        // Print emails
        console.log(emails);

        // render emails
        emails.forEach(email => {
          
          // create and style div to store info about email.
          const element = document.createElement('div');
          element.innerHTML = `${email.sender} ${email.subject} ${email.timestamp}`;
          element.style.border = 'solid';
          element.style.borderWidth = '1px';
          // checking email status
          if(email.read === true){
            element.style.backgroundColor= "#D3D3D3";
          }

          // function when div is clicked.
          element.addEventListener('click', function() {
              view_email(email.id, mailbox);

              // update email status
              fetch(`/emails/${email.id}`, {
                method: 'PUT',
                body: JSON.stringify({
                    read: true
                })
              })
          });

          document.querySelector('#emails-view').append(element);
        });
    });
}


// function to send email
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

// function to retrieve email 
function view_email(id, mailbox){
  fetch(`/emails/${id}`)
  .then(response => response.json())
  .then(email => {
      // Print email
      console.log(email);

      // add email's retrieved info to email_view div
      let email_view = document.querySelector('#email-view');
      email_view.innerHTML = `From: ${email.sender} <br> To: ${email.recipients} <br> Subject: ${email.subject} <br> Timestamp: ${email.timestamp} <hr><br> ${email.body} <br><br>`

      document.querySelector('#emails-view').style.display = 'none';
      document.querySelector('#compose-view').style.display = 'none';
      email_view.style.display = 'block';

      if(mailbox!='sent'){

      // create archive/unarchive button
      const arch_btn = document.createElement('button');
      arch_btn.innerHTML = !email.archived ? 'archive' : 'unarchive' ;
      arch_btn.addEventListener('click', function() {
        archiveOrUnarchive(email.id, email.archived);
      });
      document.querySelector('#email-view').append(arch_btn);

      // create reply button
      const reply_btn = document.createElement('button');
      reply_btn.innerHTML = 'reply';
      reply_btn.addEventListener('click', function() {
        recompose(email.id);

      });
      document.querySelector('#email-view').append(reply_btn);
    }
  });
}

// archive/unarchive function 
function archiveOrUnarchive(id, status){
  fetch(`/emails/${id}`, {
    method: 'PUT',
    body: JSON.stringify({
        archived: !status
    })
  })
  .then(() => load_mailbox('archive'))
}

// compose email function for reply
function recompose(id){
  fetch(`/emails/${id}`)
  .then(response => response.json())
  .then(email => {
    // Show compose view and hide other views
    document.querySelector('#emails-view').style.display = 'none';
    document.querySelector('#email-view').style.display = 'none';
    document.querySelector('#compose-view').style.display = 'block';

    // Clear out composition fields
    document.querySelector('#compose-recipients').value = `${email.sender}`;
    let subject = email.subject; 
    if(subject.includes('Re:')){
      subject = `${email.subject}`;
    } else {
      subject = `Re: ${email.subject}`;
    }
    document.querySelector('#compose-subject').value = subject;
    document.querySelector('#compose-body').value = `On ${email.timestamp} ${email.sender} wrote: ${email.body} `;
  });
}
