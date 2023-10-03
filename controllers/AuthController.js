const fs = require('fs')
const path = require('path')


module.exports = class AuthController {
    static async login(req, res) {
        res.render('auth/login')   
    }

    static async loginPost(req, res) {
        const {username, password} = req.body
        const file = '../data/user.json'
        const pathFile = path.join(__dirname, file)

        try {
            const dados = await fs.readFileSync(pathFile, 'utf-8')
            const usersJson = JSON.parse(dados)

            const user = usersJson.user.find((obj) => {
                return obj.username === username && obj.password === password
            });

            req.session.userid = user.id

            if (user) {
                console.log(user)
                req.session.save(() => {
                    res.redirect('/painel')
                })
                
            } else {
                console.log('Usuário não encontrado ou credenciais incorretas')
                res.render('auth/login')
            }

        } catch (err) {
            console.log(err)
        }
    }
}