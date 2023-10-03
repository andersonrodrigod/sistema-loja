const express = require('express')
const router = express.Router()

const OrderController = require('../controllers/OrderController.js')
const checkAuth = require('../helpers/authHelpers').checkAuth

router.get('/', OrderController.home)
router.get('/painel', OrderController.producers)
router.get('/producers/all', OrderController.allProducers)
router.get('/producers/all/:id', checkAuth, OrderController.allYearsProducers)
router.get('/producers/all/:id/:year', checkAuth, OrderController.allMonthProducers)
router.get('/producers/all/:id/:year/:month', checkAuth, OrderController.allProducersSalesMonth)
router.get('/producers/add', checkAuth, OrderController.addProducers)
router.post('/producers/add', checkAuth, OrderController.addProducersPost)
router.get('/sales/add', checkAuth, OrderController.addSalesProducers)
router.post('/sales/add', checkAuth, OrderController.addSalesProducersPost)
router.get('/sales', OrderController.sales)
router.get('/sales/salesyear', checkAuth, OrderController.showSales)
router.get('/sales/salesyear/:year', checkAuth, OrderController.showSalesYear)
router.get('/sales/salesyear/:year/:month', checkAuth, OrderController.showSalesMonth)
router.post('/sales/salesyear/:year/:month', checkAuth, OrderController.removeSale)



module.exports = router