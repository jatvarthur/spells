;(function() {

    var Domain = window.Domain || (window.Domain = {});
    var Scripts = Domain.Scripts || (Domain.Scripts = {});

    // scripts for abilities
    // all executes are borrowed
    //   this - stateMain
    Scripts.Ability = {
        Fireball: function(ability, unit, tile) {
            var bfW = this.board.W, bfH = this.board.H;

            for (var dj = -ability.radius; dj <= ability.radius; ++dj) {
                var j = tile._go.j + dj;
                if (j < 0 || j >= bfH) continue;
                for (var di = -ability.radius; di <= ability.radius; ++di) {
                    var i = tile._go.i + di;
                    if (i < 0 || i >= bfW) continue;
                    var ci = (j)*bfW+(i);
                    if (this.board[ci]._unit) {
                        this._dealDamage(unit, this.board[ci]._unit, ability.damage);
                    } else {
                        this._showTween(i, j, "-" + ability.damage, this.STYLE_TWEEN_DAMAGE);
                    }
                }
            }
        },

        // lightning arrow, damages enemy
        LightningArrow: function(ability, unit, tile) {
            this._dealDamage(unit, tile._unit, ability.damage);
        },

        // speeds up target unit
        Windfury: function(ability, unit, tile) {
            this._applyEffect(ability, tile._unit, tile);
        },

        // slows down target unit
        Bogfoot: function(ability, unit, tile) {
            this._applyEffect(ability, tile._unit, tile);
        },

        // raises unit attack
        Frenzy: function(ability, unit, tile) {
            this._applyEffect(ability, tile._unit, tile);
        },

        // lowers unit attack
        Pacifism: function(ability, unit, tile) {
            this._applyEffect(ability, tile._unit, tile);
        }

    };

})();