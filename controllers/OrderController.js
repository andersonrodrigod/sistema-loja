const path = require('path')
const fs = require('fs')


function formatarData(data) {
    const dataObj = new Date(data);
    if (isNaN(dataObj.getTime())) {
        // A data é inválida
        return 'Data inválida';
    }

    const dia = dataObj.getDate().toString().padStart(2, '0'); // Garante dois dígitos
    const mes = (dataObj.getMonth() + 1).toString().padStart(2, '0');
    const ano = dataObj.getFullYear().toString();
    return `${dia}/${mes}/${ano}`;
}

function getMonthName(monthNumber) {
    // Definindo um array com os nomes dos meses em português
    const months = [
        'janeiro', 'fevereiro', 'marco', 'abril',
        'maio', 'junho', 'julho', 'agosto',
        'setembro', 'outubro', 'novembro', 'dezembro'
    ];

    // Calculando o índice no array com base no número de mês fornecido
    const index = monthNumber - 1; // Subtrai 1 porque os arrays em JavaScript começam com índice 0

    // Retornando o nome do mês correspondente
    return months[index];
}

module.exports = class OrderController {
    static async home(req, res) {
        const dateActual = new Date();

        const date = formatarData(dateActual).split('/')

        const [day, month, year] = date

        const dateDay = parseInt(day, 10)
        const dateMonth = parseInt(month, 10)
        const dateYear = parseInt(year, 10)

        const dateMonthName = getMonthName(dateMonth)

        const pathSalesActual = `../data/sales/${dateYear}/${dateMonthName}.json`

        const salesMonthActual = path.join(__dirname, pathSalesActual)

       try {
        if (!fs.existsSync(salesMonthActual)) {
           return res.redirect('/painel')
        } else {
            const salesMonthPath = fs.readFileSync(salesMonthActual, 'utf-8')
            const salesMonthJson = JSON.parse(salesMonthPath)
            const salesMonth = salesMonthJson.sales

            const dbInfo = salesMonth.map((prop) => {
                let paymentMethod = prop.payment
                let discountAmount = 0
                let totalValueDiscounted = 0
                let totalValue = prop.price
                if (paymentMethod == "cartão") {
                    discountAmount = prop.price * 0.95
                    totalValueDiscounted = prop.price - discountAmount
                    totalValue = discountAmount
                } 
                let day;
                if (prop.day < 10) {
                    day = `0${prop.day}`;
                } else {
                    day = prop.day.toString();
                }
                
                return {
                    idsale: prop.idsale,
                    idproducer: prop.idproducer,
                    day: day,
                    name: prop.name,
                    product: prop.product,
                    price: prop.price,
                    payment: prop.payment,
                    description: prop.description,
                    discountAmount: totalValueDiscounted,
                    total: totalValue,
                    year,
                    month 
                }
            })

            console.log(dateMonthName);
            res.render('pages/home', {dbInfo, dateMonthName})
        }    
       } catch (err) {
        console.log(err)
       }
    }

    static async producers(req, res) {
         res.render('pages/painel')
    }

    static async allProducers(req, res) {
        const dataPath = "../data/producers.json"
        const dataProducersPath = path.join(__dirname, dataPath)
        try {
            const producersFile = await fs.readFileSync(dataProducersPath, 'utf-8')
            const producesersFileJson = JSON.parse(producersFile)
            const producesersDataJson = producesersFileJson.producers 

            const producers = producesersDataJson.map((producer) => {
                return {
                    id: producer.id,
                    name: `${producer.firstname} ${producer.lastname}`
                }
            }) 

            res.render('pages/allproducers', {producers})
        } catch (err) {
            console.log(err)
        }  
    }

    static async allYearsProducers(req, res) {
        const id = req.params.id
        const yearFolderPath = '../data/sales'
        const yearFolder = path.join(__dirname, yearFolderPath)
        const yearListFolders = fs.readdirSync(yearFolder)

        const year = yearListFolders.map((obj) => {
            return {
                name: obj,
                id
            }
        })

        console.log(year)
        res.render('pages/producersyears', {year, id}) 
    }

    static async allMonthProducers(req, res) {
        const id = req.params.id
        const year = req.params.year
        const monthFilesPath =  `../data/sales/${year}`
        const monthFolder = path.join(__dirname, monthFilesPath)
        const monthListFiles = fs.readdirSync(monthFolder)


        const month = monthListFiles.map((file) => {
            const monthName = file.replace('.json', '')
            return {
                month: file,
                year: year,
                name: monthName,
                id,
            }
        }) 
       

        console.log(month)
        res.render('pages/allproducersmonth', {month})
    }

    static async allProducersSalesMonth(req, res) {
        const id = req.params.id
        const month = req.params.month
        const year = req.params.year

        const allSalesFilePath = `../data/sales/${year}/${month}`
        const allSalesFile = path.join(__dirname, allSalesFilePath)
        const allSalesList = fs.readFileSync(allSalesFile, 'utf-8')

        const allSalesJsonList = JSON.parse(allSalesList)
        const allSales = allSalesJsonList.sales

        const salesMonth = allSales.filter(info => info.idproducer == id)
     
        const dbInfo = salesMonth.map((prop) => {
            let paymentMethod = prop.payment
            let discountAmount = 0
            let totalValueDiscounted = 0
            let totalValue = prop.price
            if (paymentMethod == "cartão") {
                discountAmount = (prop.price * 0.95)
                totalValueDiscounted = prop.price - discountAmount
                totalValue = discountAmount
            } 
            let day;
            if (prop.day < 10) {
                day = `0${prop.day}`;
            } else {
                day = prop.day.toString();
            } 
            return {
                idsale: prop.idsale,
                idproducer: prop.idproducer,
                day: day,
                name: prop.name,
                product: prop.product,
                price: prop.price,
                payment: prop.payment,
                description: prop.description,
                discountAmount: totalValueDiscounted,
                total: totalValue
            }
        })

        const totalSales = dbInfo.map(prop => {
            return prop.total
        })

        const total = totalSales.reduce((acc, tot) => acc + tot, 0)

        console.log(dbInfo)
        console.log(total)

        res.render('pages/producerssales', {dbInfo, total})
    }
    
    static async addProducers(req, res) {
        res.render('pages/addproducers')
    }

    static async addProducersPost(req, res) {
        const {firstname, lastname} = req.body
        const dataPath = "../data/producers.json"
        const dataProducersPath = path.join(__dirname, dataPath)

        try {
            const producersData = await fs.readFileSync(dataProducersPath, 'utf-8')

            const producersDataJson = JSON.parse(producersData)

            let maxId = 0

            for (const producer of producersDataJson.producers) {
                if(producer.id > maxId) {
                    maxId = producer.id
                }
            }

            const newId = maxId + 1
            //

            const newProducer = {
                id: newId,
                firstname: firstname,
                lastname: lastname
            }
            producersDataJson.producers.push(newProducer)

            const updateData = JSON.stringify(producersDataJson, null, 2)

            await fs.writeFileSync(dataProducersPath, updateData, 'utf-8')
            res.redirect('/producers/all')

        } catch (err) {
            console.log(err)
        }
    }

    static async addSalesProducers(req, res) {
        const dataPath = "../data/producers.json"
        const dataProducersPath = path.join(__dirname, dataPath)

        try {
            const dataProducers = await fs.readFileSync(dataProducersPath, 'utf-8')
            const producersJson = JSON.parse(dataProducers)
            const producers = producersJson.producers


            
            const producer = producers.map((result) => {
                const namecompleto = `${result.firstname} ${result.lastname} `
                return {
                    id: result.id,
                    name: namecompleto
                }
            })

            
            res.render('pages/addsales', {producer})
        }catch (err) {
            console.log(err)
        }
        
    }

    static async addSalesProducersPost(req, res) {
        const { date, producerselect, product, price, payment, description } = req.body

        const salesPath = '../data/sales'
        const producersPath = '../data/producers.json'
        
        const folderSalesPath = path.join(__dirname, salesPath)
        const dataProducersPath = path.join(__dirname, producersPath)

        const producersData = await fs.readFileSync(dataProducersPath, 'utf-8')
        const producersDataJson = JSON.parse(producersData)
        const producers = producersDataJson.producers 

        const producerSelect = producers.find(result => result.id == producerselect)

       

        if (date.length !== 10) {
            console.log("erro ao digitar a data")
            return res.redirect('/sales/add')
        }

        const dateSeparete = date.split('-').join('/')
        const formatDate = formatarData(dateSeparete).split('/');

        const [day, month, year] = formatDate
        const salesDay = parseInt(day, 10)
        const salesMonth = parseInt(month, 10)  
        const salesYear = parseInt(year, 10)
        const monthwritte = getMonthName(salesMonth) 

        const folderYear = path.join(folderSalesPath, year) 
        const fileMonth = path.join(folderYear, `${monthwritte}.json`)

        const content = {
            sales: []
        }
    
        try {
            if(!fs.existsSync(folderYear)) {
                await fs.mkdirSync(folderYear)
            }

            let dataSalesJson = {}
    
            if(!fs.existsSync(fileMonth)) {
                const contentJson = JSON.stringify(content, null, 4)
                await fs.writeFileSync(fileMonth, contentJson) 
                dataSalesJson = content      
            } else {
                const dataSales = await fs.readFileSync(fileMonth, 'utf-8')
                dataSalesJson = JSON.parse(dataSales);
            }

            const salesd = dataSalesJson.sales || [];
            let maxId = 0
            for (const sale of salesd) {
                if(sale.idsale > maxId) {
                    maxId = sale.idsale
                }
            }

            const newId = maxId + 1
            const priceFloat = parseFloat(price.replace(",", "."));
            const newSales = {
                idsale: newId,
                idproducer: producerSelect.id,
                day: salesDay,
                name: `${producerSelect.firstname} ${producerSelect.lastname}`,
                product: product,
                price: priceFloat,
                payment: payment,
                description: description     
            }

            dataSalesJson.sales.push(newSales)
            const updateData = JSON.stringify(dataSalesJson, null, 4)
            await fs.writeFileSync(fileMonth, updateData, 'utf-8')
            res.redirect('/sales/add')
        } catch (err) {
            console.log(err)
        }

        
    }

    static async sales(req, res) {
        res.render('pages/sales')
    }

    static async showSales(req, res) {
        const salesFolderPath = '../data/sales'
        const salesFolder = path.join(__dirname, salesFolderPath)
        const salesFolderList = await fs.readdirSync(salesFolder) 

        const sales = salesFolderList.map((folder) => {    
            return {
                year: folder
            }
        })
        console.log(salesFolderPath)

        res.render('pages/allsalesyear', {sales})
    }

    static async showSalesYear(req, res) {
        const yearParams = req.params.year
        const monthlyFilesPath =  `../data/sales/${yearParams}`
        const monthlyFilesList = path.join(__dirname, monthlyFilesPath)
        const monthlyFiles = await fs.readdirSync(monthlyFilesList)
        

        const month = monthlyFiles.map((file) => {
            const monthName = file.replace('.json', '')
            return {
                month: file,
                year: yearParams,
                name: monthName
            }
        }) 
       
        console.log(month)
        res.render('pages/allsalesmonth', {month, yearParams})
    }

    static async showSalesMonth(req, res) {
        const year = req.params.year;
        const month = req.params.month;

        const dbPath = `../data/sales/${year}/${month}`
        const dbFile = path.join(__dirname, dbPath)

        const db = await fs.readFileSync(dbFile, 'utf-8')

        const dbJson = JSON.parse(db)

        const salesMonth = dbJson.sales

        const dbInfo = salesMonth.map((prop) => {
            let paymentMethod = prop.payment
            let discountAmount = 0
            let totalValueDiscounted = 0
            let totalValue = prop.price
            if (paymentMethod == "cartão") {
                discountAmount = prop.price * 0.95
                totalValueDiscounted = prop.price - discountAmount
                totalValue = discountAmount
            } 
            let day;
            if (prop.day < 10) {
                day = `0${prop.day}`;
            } else {
                day = prop.day.toString();
            }
            
            return {
                idsale: prop.idsale,
                idproducer: prop.idproducer,
                day: day,
                name: prop.name,
                product: prop.product,
                price: prop.price,
                payment: prop.payment,
                description: prop.description,
                discountAmount: totalValueDiscounted,
                total: totalValue,
                year,
                month 
            }
        })

        
        res.render('pages/salesmonth', {dbInfo})
    }

    static async removeSale(req, res) {
        const idsale = req.body.idsale
        const year = req.params.year;
        const month = req.params.month;

        const dbPath = `../data/sales/${year}/${month}`
        const dbFile = path.join(__dirname, dbPath)

        const db = await fs.readFileSync(dbFile, 'utf-8')

        const dbJson = JSON.parse(db)

        const dbSales = dbJson.sales

        const idsaleRemove = dbSales.findIndex(item => item.idsale == idsale)

        if(idsaleRemove !== -1) {
            dbSales.splice(idsaleRemove, 1)
        }

        const updateData = JSON.stringify(dbJson, null, 4)
        await fs.writeFileSync(dbFile, updateData, 'utf-8')
        console.log(dbSales)
        res.redirect(`/sales/salesyear/${year}/${month}`)

    }
}