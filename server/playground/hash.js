/*
 
 ██████╗  ██████╗██████╗ ██╗   ██╗██████╗ ████████╗
 ██╔══██╗██╔════╝██╔══██╗╚██╗ ██╔╝██╔══██╗╚══██╔══╝
 ██████╔╝██║     ██████╔╝ ╚████╔╝ ██████╔╝   ██║   
 ██╔══██╗██║     ██╔══██╗  ╚██╔╝  ██╔═══╝    ██║   
 ██████╔╝╚██████╗██║  ██║   ██║   ██║        ██║   
 ╚═════╝  ╚═════╝╚═╝  ╚═╝   ╚═╝   ╚═╝        ╚═╝   
                                                   
 
*/

const bcrypt = require('bcryptjs')

/* let salt = bcrypt.genSaltSync(10)

console.log(salt);

let hash = bcrypt.hashSync('123321', salt)

console.log(hash); */



/* let password = '123abc'
let hashedPassword = '$2a$10$l7HK420tuubElXTLg87q7OlumvX40nvSATYFYvBqvZ465Yu84vGMy'
bcrypt.genSalt(10, (err, salt) => {
    bcrypt.hash(password, salt, (err, hash) => {
        console.log(hash)
    })
})

bcrypt.compare(password, hashedPassword, (err, res) => {
    console.log(res)

}) */

/*
 
      ██╗██╗    ██╗████████╗
      ██║██║    ██║╚══██╔══╝
      ██║██║ █╗ ██║   ██║   
 ██   ██║██║███╗██║   ██║   
 ╚█████╔╝╚███╔███╔╝   ██║   
  ╚════╝  ╚══╝╚══╝    ╚═╝   
                            
 
*/
const jwt = require('jsonwebtoken');
let data = {
    id: 10
}

let token = jwt.sign(data, '123321')

let decoded = jwt.verify(token, '123321')
console.log(decoded);