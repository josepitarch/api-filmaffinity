const translateSubtitle = (subtitle) => {
    const translates = {
        flatrate: ["suscripcion", "flatrate"],
        rent: ["alquiler", "rent"],
        buy: ["compra", "buy"]
    }

    for(let key in translates) {
        if(translates[key].find(e => e === subtitle)) {
          return key
        }
      }

}

module.exports = {translateSubtitle: translateSubtitle}