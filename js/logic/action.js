;(function() {

    var Domain = window.Domain || (window.Domain = {});
    var Scripts = Domain.Scripts || (Domain.Scripts = {});

    // what a unit can do
    // all executes are borrowed
    //   this - stateMain, action - stateMain._activeAction
    Scripts.Action = {
        NONE: {
            execute: function() { /* noop*/ }
        },

        MOVE: {
            execute: function(action) {
                this.board.place(action.moveTile._go.i, action.moveTile._go.j, action.unit);
            }
        },

        MELEE_ATTACK: {
            execute: function(action) {
                this.board.place(action.moveTile._go.i, action.moveTile._go.j, action.unit);
                // damage
                var unit = action.unit,
                    target = action.targetTile._unit;
                this._dealDamage(unit, target, unit._go.meleeAttack);
                if (target._go.hp > 0 && target._go.meleeAttack)
                    this._dealDamage(target, unit, target._go.meleeAttack);
            }
        },

        RANGED_ATTACK: {
            execute: function() { /* noop*/ }
        },

        ABILITY: {
            execute: function(action) {
                // pay for cast
                action.unit._go.mana -= action.ability.mana;
                // find caster script and run it
                var script = Scripts.Ability[action.ability._name];
                if (script)
                    script.call(this, action.ability, action.unit, action.targetTile);
            }
        }
    };

})();