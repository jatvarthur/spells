;(function() {

    var Domain = window.Domain || (window.Domain = {});
    var Data = Domain.Data || (Domain.Data = {});

    // our ability architecture is as follows:
    //   1. each ability is described by its unique _id_ and _name_
    //      alongside  with a property bag which defines its parameters and application
    //   2. for every ability we have the specific script, which applies/casts it. Currently
    //      scripts are implemented as functions borrowed by the main state during application.

    Domain.AbilityTarget = {
        NONE: 0,
        ALLY: 1,
        ENEMY: 2,
        BOTH: 3,
        TILE: 4
    };

    Data.Abilities = {
        // classic fireball, damages square 3x3
        Fireball: {
            _id: 1,
            _name: "Fireball",
            _targetable: Domain.AbilityTarget.TILE,

            radius: 1,
            mana: 10,
            damage: 20
        },

        // lightning arrow, damages enemy
        LightningArrow: {
            _id: 2,
            _name: "LightningArrow",
            _targetable: Domain.AbilityTarget.ENEMY,

            mana: 15,
            damage: 40
        },

        // speeds up target unit
        Windfury: {
            _id: 3,
            _name: "Windfury",
            _targetable: Domain.AbilityTarget.ALLY,

            mana: 5,
            prop: "speed",
            value: 2,
            duration: 3
        },

        // slows down target unit
        Bogfoot: {
            _id: 4,
            _name: "Bogfoot",
            _targetable: Domain.AbilityTarget.ENEMY,

            mana: 5,
            prop: "speed",
            value: -2,
            duration: 3
        },

        // raises unit attack
        Frenzy: {
            _id: 5,
            _name: "Frenzy",
            _targetable: Domain.AbilityTarget.ALLY,

            mana: 5,
            prop: "meleeAttack",
            value: 10,
            duration: 3
        },

        // lowers unit attack
        Pacifism: {
            _id: 6,
            _name: "Pacifism",
            _targetable: Domain.AbilityTarget.ENEMY,

            mana: 5,
            prop: "meleeAttack",
            value: -2,
            duration: 3
        }
    };

    Data.Units = {
        Mage: {
            type       : "unit_mage",
            speed      : 2,
            initiative : 10,
            hp         : 30,
            mana       : 30,
            abilities  : [


            ]
        },

        Pikeman: {
            type       : "unit_pikeman",
            speed      : 4,
            initiative : 4,
            hp         : 80,
            meleeAttack: 10
        }
    };



    // class Roster
    Domain.Roster = function() {

    };

    // class Unit
    Domain.Unit = function(proto) {
        // unit position
        this.i = -1;
        this.j = -1;
        // unit prototype
        this.proto = proto;
        // currently applied effects
        this.effects = {};
        _.extend(this, proto);
    };

    //Domain.Unit.prototype.

})();
