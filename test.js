var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
const Http = new XMLHttpRequest();
const url='https://nodebacksql.herokuapp.com/message/remote_messages?id=270610';
Http.open("GET", url);
Http.send();

Http.onreadystatechange = (e) => {
//   console.log(Http.responseText)
let data =  Http.responseText;
console.log(data.status)


}