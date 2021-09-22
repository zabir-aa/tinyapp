# TinyApp Project

TinyApp is a full stack web application built with Node and Express that allows users to shorten long URLs (à la bit.ly).

## Final Product

The web application greets user with a login prompt as the service is locked only for the registered users. The front page has both the login form for returning users and the register form for new users.

![Home page before logging in](https://github.com/zabir-aa/tinyapp/blob/master/docs/urls-page.png)

Alternative to the forms on the home page, the users can click the corner buttons of "Register" and "Sign in" to go to the Register ang Login page respectively.

!["New user registration page"](https://github.com/zabir-aa/tinyapp/blob/master/docs/register-page.png)

New user registration page



!["User login page"](https://github.com/zabir-aa/tinyapp/blob/master/docs/login-page.png)

User login page




The home page users will reach after logging in may have the following look:

!["URL page after logging in"](https://github.com/zabir-aa/tinyapp/blob/master/docs/logged-in-urls-page.png)

Home page outlook for new users




Clicking "Create New URL" will take the users to the new URL creation page:

!["Create new URL page"](https://github.com/zabir-aa/tinyapp/blob/master/docs/urls-new-page.png)

Create New URL page



After creating a few URLs, the URL page will display those as following:

!["URL page after adding some entry"](https://github.com/zabir-aa/tinyapp/blob/master/docs/logged-in-urls-list.png)

URL page after adding some entry



Clicking Edit will take the user to the URL edit / show page.

!["URL show/edit page"](https://github.com/zabir-aa/tinyapp/blob/master/docs/url-show-edit-page.png)

URL show/edit page

## Dependencies

- Node.js
- Express
- EJS
- bcrypt
- body-parser
- cookie-session

## Getting Started

- Install all dependencies (using the `npm install` command).
- Run the development web server using the `node express_server.js` command.