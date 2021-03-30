var diff = 0;
var date = Date.now();
var player

const TABS = {
    1: [
        {id: 'Scoochs', unl() { return true }, style: 'normal_tab'},
        {id: 'Stonks', unl() { return true }, style: 'normal_tab'},
        {id: 'Super', unl() { return player.prestige.unl }, style: 'normal_tab'},
        {id: 'Secret', unl() { return player.research.unl }, style: 'normal_tab'},
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
        if (player.prestige.upgrades.includes(2)) gain = gain.mul(UPGRADES.prestige[2].eff())
        if (FUNCTIONS.buyables.research.have(1)>0) gain = gain.mul(FUNCTIONS.buyables.research[1].eff())
        if (player.prestige.upgrades.includes(3)) pow = pow.mul(1.15)
        return gain.pow(pow)
    },
    getRPGain() {
        let gain = E(1)
        if (FUNCTIONS.buyables.research.have(3)>0) gain = gain.mul(FUNCTIONS.buyables.research[3].eff())
        if (player.prestige.upgrades.includes(11)) gain = gain.mul(UPGRADES.prestige[11].eff())
        if (player.prestige.upgrades.includes(13)) gain = gain.pow(1.25)
        return gain
    },
    chTabs(i, x) {
        player.tabs[i] = x
        for (let j = i+1; j < player.tabs.length; j++) player.tabs[j] = 0
    },
    prestige: {
        points() {
            let gain = player.points.pow(1/10).div(10)
            if (gain.lt(1)) return E(0)
            if (gain.gte(1e4)) gain = gain.div(1e4).pow(0.5).mul(1e4)
            if (gain.gte(1e10)) gain = gain.div(1e10).pow(0.5).mul(1e10)

            if (player.prestige.upgrades.includes(5)) gain = gain.mul(UPGRADES.prestige[5].eff())
            if (FUNCTIONS.buyables.research.have(2)>0) gain = gain.mul(FUNCTIONS.buyables.research[2].eff())
            let exp = 0.3
            if (player.floor >= 4) exp = 0.3+player.floor/20
            gain = gain.pow(E(player.floor).pow(E(1.5).pow((player.floor-1)**exp)))
            
            if (gain.gte(1e100)) gain = gain.div(1e100).pow(0.1).mul(1e100)

            if (player.prestige.upgrades.includes(10)) gain = gain.mul(UPGRADES.prestige[10].eff())

            gain = gain.softcap(1e220,0.1,0)
            return gain.floor()
        },
        can() { return this.points().gte(1) },
        reset() {
            if (this.can()) {
                player.prestige.points = player.prestige.points.add(this.points())
                this.doReset()
            }
        },
        doReset(msg, force=player.prestige.respec) {
            player.points = E(0)
            player.showUpg = ''
            let save = []
            player.treeUpgs.forEach(e => {
                if (player.canvas.TreeUpgs[e].type == 'research') save.push(e)
            });
            if (force) {
                if (msg != 'floor') player.floor = Math.max(player.floor-1,1)
                save = []
                resetTreeData()
            }
            player.treeUpgs = save
            for (let x = 0; x < Object.keys(player.canvas.TreeUpgs).length; x++) {
                let u = player.canvas.TreeUpgs[Object.keys(player.canvas.TreeUpgs)[x]]
                if (u.eff == 'chance1') u.desc = `Gain ${format(TreeUpgs.effs.chance1.eff(u.config), 1)}x more points.`
            }
            if (!getTreeFromId('m13')) addTreeUpg(0,0, 'm13')
        },
    },
    floor: {
        can() { return player.canvas.upgArray.length >= 100 && player.treeUpgs.length >= player.canvas.upgArray.length },
        go() {
            if (this.can()) {
                player.floor++
                FUNCTIONS.prestige.doReset('floor', true)
            }
        },
    },
    buyables: {
        research: {
            have(x) { return player.research.buyables[x]?player.research.buyables[x]:0 },
            can(x) { return player.research.points.gte(this[x].cost()) },
            buy(x) {
                if (this.can(x)) {
                    player.research.points = player.research.points.sub(this[x].cost())
                    if (player.research.buyables[x] === undefined) player.research.buyables[x] = 0
                    player.research.buyables[x]++
                }
            },
            cols: 3,
            1: {
                desc: 'Gain more scoochs.',
                cost(x=FUNCTIONS.buyables.research.have(1)) { return E(2).pow(x).floor() },
                eff() {
                    let lvl = FUNCTIONS.buyables.research.have(1)
                    let base = 2
                    if (player.prestige.upgrades.includes(12)) base *= 1.5
                    return E(base).pow(lvl**1.75)
                },
                effDesc(x=this.eff()) { return format(x, 1)+'x' },
            },
            2: {
                desc: 'Gain more super scoochs.',
                cost(x=FUNCTIONS.buyables.research.have(2)) { return E(3).pow(x).floor() },
                eff() {
                    let lvl = FUNCTIONS.buyables.research.have(2)
                    return E(3).pow(lvl)
                },
                effDesc(x=this.eff()) { return format(x, 1)+'x' },
            },
            3: {
                desc: 'Gain more secret scoochs.',
                cost(x=FUNCTIONS.buyables.research.have(3)) { return E(5).pow(x).floor() },
                eff() {
                    let lvl = FUNCTIONS.buyables.research.have(3)
                    return E(2).pow(lvl)
                },
                effDesc(x=this.eff()) { return format(x, 1)+'x' },
            },
        },
    },
}

function resetTreeData() {
    player.canvas = getNewPlayer().canvas
    canvas()
}

const UPGRADES = {
    prestige: {
        can(x) { return player.prestige.points.gte(this[x].cost) },
        buy(x) {
            if (this.can(x) && !player.prestige.upgrades.includes(x)) {
                player.prestige.points = player.prestige.points.sub(this[x].cost)
                player.prestige.upgrades.push(x)
            }
        },
        cols: 13,
        1: {
            unl() { return true },
            desc: 'Spam Upgrades are 12.5% stronger.',
            cost: E(1),
        },
        2: {
            unl() { return true },
            desc: 'Gain more scoochs based on unspent super scoochs.',
            cost: E(100),
            eff() {
                let eff = player.prestige.points.add(1)
                return eff
            },
            effDesc(x=this.eff()) { return format(x,0)+'x' },
        },
        3: {
            unl() { return true },
            desc: 'Raise scoochs gain by 1.15.',
            cost: E(2000),
        },
        4: {
            unl() { return true },
            desc: 'Unlock new spam upgrades (can spawn from generation only over 50 Spam Upgrades created).',
            cost: E(1e7),
        },
        5: {
            unl() { return true },
            desc: 'Gain more super scoochs based on unspent super scoochs.',
            cost: E(1e10),
            eff() {
                let eff = player.prestige.points.max(1).log10().pow(1.5).add(1)
                return eff
            },
            effDesc(x=this.eff()) { return format(x,1)+'x' },
        },
        6: {
            unl() { return true },
            desc: 'Remove first Spam upgrade for multiplier.',
            cost: E(1e15),
        },
        7: {
            unl() { return true },
            desc: 'Spam Upgrades are stronger based on your meta-scoochs.',
            cost: E(1e30),
            eff() {
                let eff = E(player.floor).max(1).pow(1/4)
                return eff
            },
            effDesc(x=this.eff()) { return format(x.sub(1).mul(100),1)+'%' },
        },
        8: {
            unl() { return true },
            desc: 'Spam upgrade "Gain more scoochs based on spam upgrades bought." is raised by 2.',
            cost: E(1e50),
        },
        9: {
            unl() { return true },
            desc: 'Unlock Secret.',
            cost: E(1e80),
        },
        10: {
            unl() { return player.research.unl },
            desc: 'Gain more super scoochs based on unspent secret scoochs.',
            cost: E(1e110),
            eff() {
                let eff = player.research.points.add(1)
                return eff
            },
            effDesc(x=this.eff()) { return format(x,1)+'x' },
        },
        11: {
            unl() { return player.research.unl },
            desc: 'Gain more secret scoochs based on unspent scoochs.',
            cost: E(1e140),
            eff() {
                let eff = player.points.max(1).log10().add(1).pow(1/2)
                return eff
            },
            effDesc(x=this.eff()) { return format(x,1)+'x' },
        },
        12: {
            unl() { return player.research.unl },
            desc: 'Secret buyables 1 are 50% stronger.',
            cost: E(1e175),
        },
        13: {
            unl() { return player.research.unl },
            desc: 'Raise secret scoochs gain by 1.25.',
            cost: E(1e210),
        },
    },
    research: {
        can(x) { return player.research.points.gte(this[x].cost) },
        buy(x) {
            if (this.can(x) && !player.research.upgrades.includes(x)) {
                player.research.points = player.research.points.sub(this[x].cost)
                player.research.upgrades.push(x)
            }
        },
        cols: 4,
        1: {
            unl() { return true },
            desc: 'Unlock Auto-Spam.',
            cost: E(25),
        },
        2: {
            unl() { return true },
            desc: 'Can generate 4th spam upgrade instead of over 50 generated.',
            cost: E(300),
        },
        3: {
            unl() { return true },
            desc: 'Unlock new spam upgrades (can spawn from generation only over 50 Spam Upgrades created).',
            cost: E(15000),
        },
        4: {
            unl() { return true },
            desc: 'Raise spam upgrades 2-3 by 2.5.',
            cost: E(1e7),
        },
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