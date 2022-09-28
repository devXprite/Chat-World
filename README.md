

<div align="center">
  </a>
  <h3 align="center">Realtime Web Chatapp</h3>

  <p align="center">
    A Simple Realtime Chat app using Firebase
    <br />
    <br />
    <a href="https://chatapp.js.org/">View Demo</a>
    ·
    <a href="https://github.com/devxprite/realtime-chat-app/issues">Report Bug</a>
    ·
    <a href="https://github.com/devxprite/realtime-chat-app/issues">Request Feature</a>
    <br />
  </p>
</div>

<!-- ABOUT THE PROJECT -->
## About The Project

<!-- [![Product Name Screen Shot][product-screenshot]](#) -->

This is a simple Realtime Chat app using Firebase. Here you can chat with anyone without Login or SignUP. It
        helps you to meet new people and make new friends.

<!-- Here's why:
* Your time should be focused on creating something amazing. A project that solves a problem and helps others
* You shouldn't be doing the same tasks over and over like creating a README from scratch
* You should implement DRY principles to the rest of your life :smile: -->

<p align="right">(<a href="#top">back to top</a>)</p>


### Built With

* [JQuery](https://jquery.com)
* [FireBase](https://firebase.google.com/)
* [Modernizr ](https://modernizr.com/)
* [GSAP](https://greensock.com/gsap/)

<p align="right">(<a href="#top">back to top</a>)</p>


<!-- GETTING STARTED -->
## Getting Started

To get a local copy up and running follow these simple example steps.

### Prerequisites

For you to be able to understant code, it will be nice if you have basic understanding of HTML, CSS and JavaScript.


### Installation

1. Get the snippet for your app's Firebase config object [https://console.firebase.google.com/](https://console.firebase.google.com/)
2. Clone the repo
   ```sh
   git clone https://github.com/devxprite/realtime-chat-app.git
   ```
3. Enter snippet in `firebaseConfig.js` like this:
   ```js
   const firebaseConfig = {
        apiKey: process.env.apiKey,
        authDomain: process.env.authDomain,
        databaseURL: process.env.databaseURL,
        projectId: process.env.projectId,
        storageBucket: process.env.storageBucket,
        messagingSenderId: process.env.messagingSenderId,
        appId: process.env.appId
    };

    firebase.initializeApp(firebaseConfig);
   ```

<p align="right">(<a href="#top">back to top</a>)</p>


## Contributing

Contributions are what make the open source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

If you have a suggestion that would make this better, please fork the repo and create a pull request. You can also simply open an issue with the tag "enhancement".
Don't forget to give the project a star! Thanks again!

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

<p align="right">(<a href="#top">back to top</a>)</p>



<!-- LICENSE -->
## License

Distributed under the MIT License. See `LICENSE.txt` for more information.

<p align="right">(<a href="#top">back to top</a>)</p>
