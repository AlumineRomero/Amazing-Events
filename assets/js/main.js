let divHome = document.getElementById("grande")
let divPast = document.getElementById("grandePast")
let divUpcoming = document.getElementById("grandeUpcoming")
let divDetails = document.getElementById("details")

const { createApp } = Vue
createApp({
    data() {
        return {
            events: [],
            eventsName: "",
            filteredEvents:[],
            categorias: [],
            categoriasChequeadas:[],
            currentDate: '',
            cardDetail: {},
            id: '',
            statsEvents: [],
            stastPast: [],
            statsUp: [],
            percentage: new Intl.NumberFormat('default', { style: 'percent', minimumFractionDigits: 0, maximumFractionDigits: 1,}),
            numberFormat: new Intl.NumberFormat('en-US'),
            moneyFormat: new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }),
            }},
    created() {
        fetch("https://amazing-events.herokuapp.com/api/events")
        .then(response => response.json())
        .then(dataJson =>{
        // 
        const queryString = location.search
        const params = new URLSearchParams(queryString)
        const id = params.get("id")
        this.cardDetail = dataJson.events.find(event => event._id === id)     
        // 
        this.currentDate = dataJson.currentDate

        if (document.title == 'Home'){
            this.events = dataJson.events
        }
        if(document.title == 'Past Events'){
            this.events = dataJson.events.filter(event => (event.date < this.currentDate))
        }
        if(document.title == 'Upcoming Events'){
            this.events = dataJson.events.filter(event => (event.date > this.currentDate))
        }
        // 
        this.getCategorias()
        
        this.filteredEvents = this.events
        // 
        this.statsEvents = this.asistenciaCapacidad(dataJson.events)
        this.statsPast = this.filtroPastUpTable(dataJson.events.filter(event => (event.date < this.currentDate))) 
        this.statsUp = this.filtroPastUpTable(dataJson.events.filter(event => (event.date > this.currentDate)))
        // 
    })},
methods: {
    searchFilter(eventsArr){
        this.events = eventsArr.filter(event =>
        event.name.toLowerCase().includes(this.eventsName.toLowerCase()));
    },
    getCategorias(){
        this.categorias = this.events.map(
            event => event.category)
        this.categorias = new Set(this.categorias)
    },
    asistenciaCapacidad (almacenado){
        let pastEvents = almacenado.filter(event => event.assistance != undefined)
        let capacidad = almacenado.map(event => event.capacity)
        let maxCapacidad = Math.max(...capacidad)
        let eventMaxCapacidad = almacenado.find(event => event.capacity == maxCapacidad)
        // 
        let asistencia = pastEvents.map(event => event.assistance / event.capacity)
        //  
        let maxAsistencia = Math.max(...asistencia)
        let eventMaxAsistencia = pastEvents.find(event => event.assistance / event.capacity == maxAsistencia)
        // 
        let minAsistencia = Math.min(...asistencia)
        let eventMinAsistencia = pastEvents.find(event => event.assistance / event.capacity == minAsistencia)
        // 
        return[eventMaxAsistencia,  eventMinAsistencia, eventMaxCapacidad]
    },
    filtroPastUpTable(almacenado) {
            let categorias = []
        almacenado.forEach(event => {
            if (!categorias.includes(event.category)) {
                categorias.push(event.category)
            }
        })
        let arrayStats = []
        categorias.forEach(categoria => {
            let primerFiltrado = almacenado.filter(event => event.category == categoria )
            let ganancias = primerFiltrado.map(event => (event.assistance ?event.assistance :event.estimate) * event.price)
            let porcentajeAsistencias = primerFiltrado.map(event => (event.assistance ?event.assistance :event.estimate) / event.capacity)
            let totalGanancias = 0
            let totalAsistenciaCate = 0
            ganancias.forEach(ganancia => 
                totalGanancias += ganancia
            )
            porcentajeAsistencias.forEach(porcentaje => totalAsistenciaCate += porcentaje)
            arrayStats.push([categoria, totalGanancias, (totalAsistenciaCate / primerFiltrado.length)])
        })
        return arrayStats
    }
},
computed: {
    filtrosCruzados(){
            if (this.categoriasChequeadas.length != 0) {
                this.events = this.filteredEvents.filter(event =>{
                    return this.categoriasChequeadas.includes(event.category)
                })
            }         
            else {
                this.events = this.filteredEvents
            }
            if(this.eventsName != '') {
            this.searchFilter(this.events)
        }
    }}
}).mount('#app')