console.log("frontend")

document.addEventListener('click', e=> {
    if(e.target.dataset.short){
        const url = `${window.location.origin}/${e.target.dataset.short}`

        navigator.clipboard
        .writeText(url)
        .then(()=>{
            console.log('Copiado')
        })
        .catch(()=>{
            console.log('Error')
        })
    }
})