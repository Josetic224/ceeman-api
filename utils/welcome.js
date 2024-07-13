const generateDynamicEmail = (name)=>{
    return `

    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Email Template</title>
        <style>
            body {
                font-family: Arial, sans-serif;
                margin: 0;
                padding: 0;
                background-color: #f4f4f4;
                color: #333;
            }
            .email-container {
                max-width: 600px;
                margin: auto;
                background-color: #ffffff;
                padding: 20px;
            }
            .header {
                text-align: center;
                padding: 20px;
                background-color: #0044cc;
                color: #ffffff;
            }
            .header img {
                width: 100px;
            }
            .header h1 {
                margin: 0;
                font-size: 24px;
            }
            .content {
                padding: 20px;
                text-align: center;
            }
            .content h2 {
                font-size: 20px;
                color: #0044cc;
            }
            .content p {
                font-size: 16px;
                line-height: 1.5;
            }
            .footer {
                padding: 20px;
                background-color: #e6e6e6;
                text-align: center;
            }
            .footer p {
                margin: 5px 0;
                font-size: 14px;
            }
            .social-icons {
                margin: 10px 0;
            }
            .social-icons a {
                margin: 0 5px;
                text-decoration: none;
                color: #333;
            }
            .social-icons svg {
                width: 24px;
                height: 24px;
            }
        </style>
    </head>
    <body>
        <div class="email-container">
            <div class="header">
                <img src="https://ceee-man.vercel.app/assets/2_20240611_041530_0001-BRsoDga6.svg" alt="Royalceeman">
                <h1>Ceeman Generators</h1>
            </div>
            <div class="content">
                <h2>THANKS FOR SIGNING UP!</h2>
                <p>Thanks for choosing Ceeman Generators</p>
                <p>Hi ${name},</p>
                <p>We're excited to have you on board. Explore our exclusive and affordable Power-Gnerating Services and Equipments and enjoy the benefits of being a part of the Ceeman community!</p>
                <p>Thanks,</p>
                <p>The Royal Ceeman Team</p>
            </div>
            <div class="footer">
                <p>Get in touch</p>
                <p>+234 706 284 8038</p>
                <p><a href="https://royalceeman.com">www.royalceeman.com</a></p>
                <div class="social-icons">
                    <a href="https://www.facebook.com">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M22.675 0H1.325C.593 0 0 .593 0 1.325v21.351C0 23.407.593 24 1.325 24H12.82v-9.294H9.691v-3.622h3.129V8.413c0-3.1 1.893-4.791 4.658-4.791 1.325 0 2.463.099 2.794.143v3.24l-1.918.001c-1.504 0-1.794.715-1.794 1.763v2.313h3.587l-.467 3.622h-3.12V24h6.107c.73 0 1.324-.593 1.324-1.324V1.325C24 .593 23.407 0 22.675 0z"/></svg>
                    </a>
                    <a href="https://www.linkedin.com">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M22.23 0H1.77C.79 0 0 .78 0 1.75v20.5C0 23.22.79 24 1.77 24h20.46c.98 0 1.77-.78 1.77-1.75V1.75C24 .78 23.22 
                            M22.23 24h-4.98v-8.44c0-1.95-.73-3.26-2.56-3.26-1.4 0-2.23.94-2.6 1.85-.14.34-.18.82-.18 1.3V24h-5.02s.07-14.5 0-16.02h5.02v2.27c-.01.01-.02.02-.03.03h.03v-.03c.65-.99 1.83-2.4 4.45-2.4 3.26 0 5.7 2.14 5.7 6.76v9.96z"/></svg>
                        </a>
                    </div>
                </div>
            </div>
        </body>
        </html>
        
`
}

module.exports = generateDynamicEmail