var diff = 0;
var date = Date.now();
var player

const TABS = {
    1: [
        {id: 'Treemental', unl() { return true }, style: 'normal_tab'},
        {id: 'Options', unl() { return true }, style: 'normal_tab'},
    ],
}

const FUNCTIONS = {
    getPointsGain() {
        if (!player.treeUpgs.includes('m13')) return E(0)
        let gain = E(1)
        let pow = E(1)
        for (let x = 0; x < Object.keys(player.canvas.TreeUpgs).length; x++) {
            let u = player.canvas.TreeUpgs[Object.keys(player.canvas.TreeUpgs)[x]]
            if (u.type == 'points' && player.treeUpgs.includes(Object.keys(player.canvas.TreeUpgs)[x])) gain = gain.mul(TreeUpgs.effs[u.eff].eff(u.config))
            if (u.type == 'pow_points' && player.treeUpgs.includes(Object.keys(player.canvas.TreeUpgs)[x])) pow = pow.mul(TreeUpgs.effs[u.eff].eff(u.config))
        }
        return gain.pow(pow)
    },
    chTabs(i, x) {
        player.tabs[i] = x
        for (let j = i+1; j < player.tabs.length; j++) player.tabs[j] = 0
    },
}

function loop() {
    diff = Date.now()-date;
    calc(diff/1000);
    date = Date.now();
}

function format(ex, acc=3) {
    ex = E(ex)
    if (ex.isInfinite()) return 'Infinity'
    let e = ex.log10().floor()
    if (e.lt(9)) {
        if (e.lt(3)) {
            return ex.toFixed(acc)
        }
        return ex.floor().toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')
    } else {
        if (ex.gte("eeee9")) {
            let slog = ex.slog()
            return (slog.gte(1e9)?'':E(10).pow(slog.sub(slog.floor())).toFixed(3)) + "F" + format(slog.floor(), 0)
        }
        let m = ex.div(E(10).pow(e))
        return (e.log10().gte(9)?'':m.toFixed(3))+'e'+format(e,0)
    }
}

setInterval(loop, 50)