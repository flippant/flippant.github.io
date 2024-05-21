var app = angular.module('skillchain', []);

app.filter('copyText', function() {
    return function(wsList) {
        let txt = '';
        for(item in wsList) {
            txt += wsList[item].ws + (wsList[item].sc == 'hidden' ? ' > ' : ' (' + wsList[item].sc + ') > ')
        }
        txt = txt.slice(0,-3)
        return txt;
    };
});

app.controller('skillchainCtrl', function ($scope) {
    $scope.form = 'makeSC'
    $scope.WSlist = []
    $scope.selectWeaponskills = clone(weaponskills);
    $scope.selectedWS = "";
    let prevWS = "";
    $scope.error = "";
    $scope.skillchains = skillchains;
    $scope.weaponskills = weaponskills;
    $scope.combosList = []
    $scope.searchResults = {};
    $('#ws-copy').val = '';

    $scope.reset = function() {
        $scope.WSlist = []
        $scope.selectWeaponskills = clone(weaponskills);
        $scope.selectedWS = "";
        prevWS = "";
        $scope.error = "";
        $('#ws-copy').val = '';
    }

    $scope.submitWS = function() {
        $scope.error = "";
        if(!$scope.selectedWS) {
            $scope.error = "You must select a weaponskill.";
            return;
        }
        if(!prevWS) { // first WS
            prevWS = $scope.selectedWS;
            $scope.WSlist.push({ws:$scope.selectedWS,sc:'hidden'});
        } else { 
            const SC = getSC(prevWS,$scope.selectedWS);
            $scope.WSlist.push({ws:$scope.selectedWS,sc:SC});
            prevWS = SC;
        }        
        fillSelect(prevWS);
    }

    $scope.findWS = function(){
        $scope.combosList = [];
        $scope.error = "";
        if(!($scope.selectedSkill1 && $scope.selectedSkill2 && $scope.selectedSC)) {
            $scope.error = "You must select two skills and a skillchain.";
            return;
        }

        for(ws1 in weaponskills[$scope.selectedSkill1]) {
            for(ws2 in weaponskills[$scope.selectedSkill2]) {
                let resultingSC = getSC(ws1,ws2);
                if(resultingSC) {
                    if(resultingSC==$scope.selectedSC || $scope.selectedSC=='Light' && resultingSC==skillchains.Light.Light || $scope.selectedSC=='Darkness' && resultingSC==skillchains.Darkness.Darkness) {
                        $scope.combosList.push({ws1:ws1,ws2:ws2,sc:resultingSC});
                    }
                }
            }
        }
    }

    let fillSelect = function(prop) {        
        $scope.selectWeaponskills = {}
        if(prevWS=='Light [lvl.4]' || prevWS=='Darkness [lvl.4]') {
            $scope.error = "You've reached the end! You cannot skillchain off of a level 4 skillchain."
        } else {
            for(skill in weaponskills) {
                $scope.selectWeaponskills[skill] = {}
                for (weaponskill in weaponskills[skill]) {    
                    if (getSC(prop,weaponskill)) {
                        $scope.selectWeaponskills[skill][weaponskill] = {result:' ['+getSC(prop,weaponskill)+']'}
                    }
                };
            };
        };
        $('.ws-list').val('')
        $scope.selectedWS = ""; //Some bug isn't resetting this when select menu is refilled
    }

    let getProps = function(WS) {
        for (skill in weaponskills) {
            for (weaponskill in weaponskills[skill]) {
                if (weaponskill==WS) {
                    return weaponskills[skill][weaponskill]
                }
            }
        }
        return false;
    }

    let getSC = function(WS1,WS2) {
        const WS1props = getProps(WS1)
        const WS2props = getProps(WS2)
        
        if (WS1props && WS2props) {
            for (WS1prop in WS1props) {
                for (WS2prop in WS2props) {
                    if (skillchains[WS1props[WS1prop]][WS2props[WS2prop]]!=undefined) {
                        return skillchains[WS1props[WS1prop]][WS2props[WS2prop]];
                    }
                }
            }
        }
        return false;
    }   

    $scope.generateSearch = function(searchSkill,searchName,searchProp) {
        $scope.searchResults = {};
        for(skill in weaponskills) {
            $scope.searchResults[skill] = {}
            if ( (!searchSkill || searchSkill.toLowerCase() === skill.toLowerCase()) ) {
                for (weaponskill in weaponskills[skill]) {    
                    if ( (!searchName || weaponskill.toLowerCase().indexOf(searchName.toLowerCase()) >= 0) && (!searchProp || [weaponskills[skill][weaponskill].skillchain_a,weaponskills[skill][weaponskill].skillchain_b,weaponskills[skill][weaponskill].skillchain_c].includes(searchProp)) ) {
                        $scope.searchResults[skill][weaponskill] = weaponskills[skill][weaponskill];
                    };
                };
            };
        };
        return $scope.searchResults;
    }

    $scope.copytext = function(element) {
        $(element).focus().select();
        let copied = document.execCommand('copy');

        $(".copied").fadeIn(300);
        $(".copied").delay(800).fadeOut(300);
    }
})

const 
    TRANSFIXION = 'Transfixion',
    COMPRESSION = 'Compression',
    LIQUEFACTION = 'Liquefaction',
    SCISSION = 'Scission',
    REVERBERATION = 'Reverberation',
    DETONATION = 'Detonation',
    INDURATION = 'Induration',
    IMPACTION = 'Impaction',
    GRAVITATION = 'Gravitation',
    DISTORTION = 'Distortion',
    FUSION = 'Fusion',
    FRAGMENTATION = 'Fragmentation',
    LIGHT = 'Light',
    DARKNESS = 'Darkness'

const skillchains = {
    Transfixion : {
        Compression: COMPRESSION, Scission: DISTORTION, Reverberation: REVERBERATION
    },
    Compression : {
        Transfixion: TRANSFIXION, Detonation: DETONATION
    },
    Liquefaction : {
        Scission: SCISSION, Impaction: FUSION
    },
    Scission : {
        Liquefaction: LIQUEFACTION, Reverberation: REVERBERATION, Detonation: DETONATION
    },
    Reverberation : {
        Induration: INDURATION, Impaction: IMPACTION
    },
    Detonation : {
        Compression: GRAVITATION, Scission: SCISSION
    },
    Induration : {
        Compression: COMPRESSION, Reverberation: FRAGMENTATION, Impaction: IMPACTION
    },
    Impaction : {
        Liquefaction: LIQUEFACTION, Detonation: DETONATION
    },
    Gravitation : {
        Distortion: DARKNESS, Fragmentation: FRAGMENTATION
    },
    Distortion : {
        Gravitation: DARKNESS, Fusion: FUSION
    },
    Fusion : {
        Gravitation: GRAVITATION, Fragmentation: LIGHT
    },
    Fragmentation : {
        Distortion: DISTORTION, Fusion: LIGHT
    },
    Light: {
        Light: "Light [lvl.4]"
    },
    Darkness: {
        Darkness: "Darkness [lvl.4]"
    }
}

const weaponskills = {
    'Hand-to-Hand' : {
        'Combo' : {
            skillchain_a:IMPACTION
        },
        'Shoulder Tackle' : {
            skillchain_a:IMPACTION,skillchain_b:REVERBERATION
        },
        'One Inch Punch' : {
            skillchain_a:COMPRESSION
        },
        'Backhand Blow' : {
            skillchain_a:DETONATION
        },
        'Raging Fists' : {
            skillchain_a:IMPACTION
        },
        'Spinning Attack' : {
            skillchain_a:LIQUEFACTION,skillchain_b:IMPACTION
        },
        'Howling Fist' : {
            skillchain_a:TRANSFIXION,skillchain_b:IMPACTION
        },
        'Dragon Kick' : {
            skillchain_a:FRAGMENTATION
        },
		'Asuran Fists' : {
            skillchain_a:GRAVITATION,skillchain_b:LIQUEFACTION
        },
        'Final Heaven' : {
            skillchain_a:LIGHT,skillchain_b:FUSION
        },
        "Ascetic's Fury" : {
            skillchain_a:FUSION,skillchain_b:TRANSFIXION
        },
        'Stringing Pummel' : {
            skillchain_a:GRAVITATION,skillchain_b:LIQUEFACTION
        },
        'Tornado Kick' : {
            skillchain_a:INDURATION,skillchain_b:IMPACTION,skillchain_c:DETONATION
        },
        'Victory Smite' : {
            skillchain_a:LIGHT,skillchain_b:FRAGMENTATION
        },
        'Shijin Spiral' : {
            skillchain_a:FUSION,skillchain_b:REVERBERATION
        },
        'Maru Kala' : {
            skillchain_a:DETONATION,skillchain_b:COMPRESSION,skillchain_c:DISTORTION
        }
    },
    'Dagger' : {
        'Gust Slash' : {
            skillchain_a:DETONATION
        },
		'Wasp Sting' : {
            skillchain_a:SCISSION
        },
		'Viper Bite' : {
            skillchain_a:SCISSION
        },
		'Shadow Stitch' : {
            skillchain_a:REVERBERATION
        },
		'Cyclone' : {
            skillchain_a:DETONATION,skillchain_b:IMPACTION
        },
		'Dancing Edge' : {
            skillchain_a:SCISSION,skillchain_b:DETONATION
        },
        'Shark Bite' : {
            skillchain_a:FRAGMENTATION
        },
		'Evisceration' : {
            skillchain_a:GRAVITATION,skillchain_b:TRANSFIXION
        },
		'Aeolian Edge' : {
            skillchain_a:IMPACTION,skillchain_b:SCISSION,skillchain_c:DETONATION
        },
		'Exenterator' : {
            skillchain_a:FRAGMENTATION,skillchain_b:SCISSION
        },
		'Mercy Stroke' : {
            skillchain_a:DARKNESS,skillchain_b:GRAVITATION
        },
		'Mandalic Stab' : {
            skillchain_a:FUSION,skillchain_b:COMPRESSION
        },        
        'Pyrrhic Kleos' : {
            skillchain_a:DISTORTION,skillchain_b:SCISSION
        },
        'Mordant Rime' : {
            skillchain_a:FRAGMENTATION,skillchain_b:DISTORTION
        },
        "Rudra's Storm" : {
            skillchain_a:DARKNESS,skillchain_b:DISTORTION
        },
        'Ruthless Stroke': {
            skillchain_a:LIQUEFACTION,skillchain_b:IMPACTION,skillchain_c:FRAGMENTATION
        }
    },
    "Sword" : {
        'Fast Blade' : {
            skillchain_a:SCISSION,
        },
        'Burning Blade' : {
            skillchain_a:LIQUEFACTION,
        },
        'Red Lotus Blade' : {
            skillchain_a:LIQUEFACTION,skillchain_b:DETONATION,
        },
        'Flat Blade' : {
            skillchain_a:IMPACTION,
        },
        'Shining Blade' : {
            skillchain_a:SCISSION,
        },
        'Seraph Blade' : {
            skillchain_a:SCISSION,
        },
        'Circle Blade' : {
            skillchain_a:REVERBERATION,skillchain_b:IMPACTION,
        },
        'Vorpal Blade' : {
            skillchain_a:SCISSION,skillchain_b:IMPACTION,
        },
        'Swift Blade' : {
            skillchain_a:GRAVITATION,
        },
        'Savage Blade' : {
            skillchain_a:FRAGMENTATION,skillchain_b:SCISSION,
        },
        'Knights of Round' : {
            skillchain_a:LIGHT,skillchain_b:FUSION,
        },
        'Death Blossom' : {
            skillchain_a:FRAGMENTATION,skillchain_b:DISTORTION,
        },
        'Atonement' : {
            skillchain_a:FUSION,skillchain_b:REVERBERATION,
        },
        'Expiacion' : {
            skillchain_a:DISTORTION,skillchain_b:SCISSION,
        },
        'Chant du Cygne' : {
            skillchain_a:LIGHT,skillchain_b:DISTORTION,
        },
        'Requiescat' : {
            skillchain_a:GRAVITATION,skillchain_b:SCISSION,
        },
        'Imperator' : {
            skillchain_a:DETONATION,skillchain_b:COMPRESSION,skillchain_c:DISTORTION,
        }
    },
    "Great Sword" : {
        'Hard Slash' : {
            skillchain_a:SCISSION,
        },
        'Power Slash' : {
            skillchain_a:TRANSFIXION,
        },
        'Frostbite' : {
            skillchain_a:INDURATION,
        },
        'Freezebite' : {
            skillchain_a:INDURATION,skillchain_b:DETONATION,
        },
        'Shockwave' : {
            skillchain_a:REVERBERATION,
        },
        'Crescent Moon' : {
            skillchain_a:SCISSION,
        },
        'Sickle Moon' : {
            skillchain_a:SCISSION,skillchain_b:IMPACTION,
        },
        'Spinning Slash' : {
            skillchain_a:FRAGMENTATION,
        },
        'Ground Strike' : {
            skillchain_a:FRAGMENTATION,skillchain_b:DISTORTION,
        },
        'Scourge' : {
            skillchain_a:LIGHT,skillchain_b:FUSION,
        },
        'Herculean Slash' : {
            skillchain_a:INDURATION,skillchain_b:IMPACTION,skillchain_c:DETONATION
        },
        'Torcleaver' : {
            skillchain_a:LIGHT,skillchain_b:DISTORTION,
        },
        'Resolution' : {
            skillchain_a:FRAGMENTATION,skillchain_b:SCISSION,
        },
        'Dimidiation' : {
            skillchain_a:LIGHT,skillchain_b:FRAGMENTATION,
        },
        'Fimbulvetr' : {
            skillchain_a:DETONATION,skillchain_b:COMPRESSION,skillchain_c:DISTORTION,
        }
    },
    "Axe" : {
        'Raging Axe' : {
            skillchain_a:DETONATION,skillchain_b:IMPACTION,
        },
        'Smash Axe' : {
            skillchain_a:INDURATION,skillchain_b:REVERBERATION,
        },
        'Gale Axe' : {
            skillchain_a:DETONATION,
        },
        'Avalanche Axe' : {
            skillchain_a:SCISSION,skillchain_b:IMPACTION,
        },
        'Spinning Axe' : {
            skillchain_a:LIQUEFACTION,skillchain_b:SCISSION,skillchain_c:IMPACTION
        },
        'Rampage' : {
            skillchain_a:SCISSION,
        },
        'Calamity' : {
            skillchain_a:SCISSION,skillchain_b:IMPACTION,
        },
        'Mistral Axe' : {
            skillchain_a:FUSION,
        },
        'Decimation' : {
            skillchain_a:FUSION,skillchain_b:REVERBERATION,
        },
        'Onslaught' : {
            skillchain_a:DARKNESS,skillchain_b:GRAVITATION,
        },
        'Primal Rend' : {
            skillchain_a:GRAVITATION,skillchain_b:REVERBERATION,
        },
        'Bora Axe' : {
            skillchain_a:SCISSION,skillchain_b:DETONATION,
        },
        'Cloudsplitter' : {
            skillchain_a:DARKNESS,skillchain_b:FRAGMENTATION,
        },
        'Ruinator' : {
            skillchain_a:DISTORTION,skillchain_b:DETONATION,
        },
        'Blitz': {
            skillchain_a:LIQUEFACTION,skillchain_b:IMPACTION,skillchain_c:FRAGMENTATION,
        }
    },
    "Great Axe" : {
        'Shield Break' : {
            skillchain_a:IMPACTION,
        },
        'Iron Tempest' : {
            skillchain_a:SCISSION,
        },
        'Sturmwind' : {
            skillchain_a:REVERBERATION,skillchain_b:SCISSION,
        },
        'Armor Break' : {
            skillchain_a:IMPACTION,
        },
        'Keen Edge' : {
            skillchain_a:COMPRESSION,
        },
        'Weapon Break' : {
            skillchain_a:IMPACTION,
        },
        'Raging Rush' : {
            skillchain_a:INDURATION,skillchain_b:REVERBERATION,
        },
        'Full Break' : {
            skillchain_a:DISTORTION,
        },
        'Steel Cyclone' : {
            skillchain_a:DISTORTION,skillchain_b:DETONATION,
        },
        'Metatron Torment' : {
            skillchain_a:LIGHT,skillchain_b:FUSION,
        },
        "King's Justice" : {
            skillchain_a:FRAGMENTATION,skillchain_b:SCISSION,
        },
        'Fell Cleave' : {
            skillchain_a:SCISSION,skillchain_b:DETONATION,
        },
        "Ukko's Fury" : {
            skillchain_a:LIGHT,skillchain_b:FRAGMENTATION,
        },
        'Upheaval' : {
            skillchain_a:FUSION,skillchain_b:COMPRESSION,
        },
        'Disaster' : {
            skillchain_a:TRANSFIXION,skillchain_b:SCISSION,skillchain_c:GRAVITATION,
        }
    },
    "Scythe" : {
        'Slice' : {
            skillchain_a:SCISSION,
        },
        'Dark Harvest' : {
            skillchain_a:REVERBERATION,
        },
        'Shadow of Death' : {
            skillchain_a:INDURATION,skillchain_b:REVERBERATION,
        },
        'Nightmare Scythe' : {
            skillchain_a:COMPRESSION,skillchain_b:SCISSION,
        },
        'Spinning Scythe' : {
            skillchain_a:REVERBERATION,skillchain_b:SCISSION,
        },
        'Vorpal Scythe' : {
            skillchain_a:TRANSFIXION,skillchain_b:SCISSION,
        },
        'Guillotine' : {
            skillchain_a:INDURATION,
        },
        'Cross Reaper' : {
            skillchain_a:DISTORTION,
        },
        'Spiral Hell' : {
            skillchain_a:DISTORTION,skillchain_b:SCISSION,
        },
        'Catastrophe' : {
            skillchain_a:DARKNESS,skillchain_b:GRAVITATION,
        },
        'Insurgency' : {
            skillchain_a:FUSION,skillchain_b:COMPRESSION,
        },
        'Infernal Scythe' : {
            skillchain_a:COMPRESSION,skillchain_b:REVERBERATION,
        },
        'Quietus' : {
            skillchain_a:DARKNESS,skillchain_b:DISTORTION,
        },
        'Entropy' : {
            skillchain_a:GRAVITATION,skillchain_b:REVERBERATION,
        },
        'Origin' : {
            skillchain_a:INDURATION,skillchain_b:REVERBERATION,skillchain_c:FUSION,
        }
    },
    "Polearm" : {
        'Double Thrust' : {
            skillchain_a:TRANSFIXION,
        },
        'Thunder Thrust' : {
            skillchain_a:TRANSFIXION,skillchain_b:IMPACTION,
        },
        'Raiden Thrust' : {
            skillchain_a:TRANSFIXION,skillchain_b:IMPACTION,
        },
        'Leg Sweep' : {
            skillchain_a:IMPACTION,
        },
        'Penta Thrust' : {
            skillchain_a:COMPRESSION,
        },
        'Vorpal Thrust' : {
            skillchain_a:REVERBERATION,skillchain_b:TRANSFIXION,
        },
        'Skewer' : {
            skillchain_a:TRANSFIXION,skillchain_b:IMPACTION,
        },
        'Wheeling Thrust' : {
            skillchain_a:FUSION,
        },
        'Impulse Drive' : {
            skillchain_a:GRAVITATION,skillchain_b:INDURATION,
        },
        'Geirskogul' : {
            skillchain_a:LIGHT,skillchain_b:DISTORTION,
        },
		'Drakesbane' : {
			skillchain_a:FUSION,skillchain_b:TRANSFIXION,
		},
        'Sonic Thrust' : {
            skillchain_a:TRANSFIXION,skillchain_b:SCISSION,
        },
        "Camlann's Torment" : {
            skillchain_a:LIGHT,skillchain_b:FRAGMENTATION,
        },
        'Stardiver' : {
            skillchain_a:GRAVITATION,skillchain_b:TRANSFIXION,
        },
        'Diarmuid' : {
            skillchain_a:TRANSFIXION,skillchain_b:SCISSION,skillchain_c:GRAVITATION,
        }
    },
    "Katana" : {
        'Blade: Rin' : {
            skillchain_a:TRANSFIXION,
        },
        'Blade: Retsu' : {
            skillchain_a:SCISSION,
        },
        'Blade: Teki' : {
            skillchain_a:REVERBERATION,
        },
        'Blade: To' : {
            skillchain_a:INDURATION,skillchain_b:DETONATION,
        },
        'Blade: Chi' : {
            skillchain_a:IMPACTION,skillchain_b:TRANSFIXION,
        },
        'Blade: Ei' : {
            skillchain_a:COMPRESSION,
        },
        'Blade: Jin' : {
            skillchain_a:IMPACTION,skillchain_b:DETONATION,
        },
        'Blade: Ten' : {
            skillchain_a:GRAVITATION,
        },
        'Blade: Ku' : {
            skillchain_a:GRAVITATION,skillchain_b:TRANSFIXION,
        },
        'Blade: Metsu' : {
            skillchain_a:DARKNESS,skillchain_b:FRAGMENTATION,
        },
        'Blade: Kamu' : {
            skillchain_a:FRAGMENTATION,skillchain_b:COMPRESSION,
        },
        'Blade: Yu' : {
            skillchain_a:REVERBERATION,skillchain_b:SCISSION,
        },
        'Blade: Hi' : {
            skillchain_a:DARKNESS,skillchain_b:GRAVITATION,
        },
        'Blade: Shun' : {
            skillchain_a:FUSION,skillchain_b:IMPACTION,
        },
        'Zesho Meppo' : {
            skillchain_a:INDURATION,skillchain_b:REVERBERATION,skillchain_c:FUSION,
        }
    },
    "Great Katana" : {
        'Tachi: Enpi' : {
            skillchain_a:TRANSFIXION,skillchain_b:SCISSION,
        },
        'Tachi: Hobaku' : {
            skillchain_a:INDURATION,
        },
        'Tachi: Goten' : {
            skillchain_a:TRANSFIXION,skillchain_b:IMPACTION,
        },
        'Tachi: Kagero' : {
            skillchain_a:LIQUEFACTION,
        },
        'Tachi: Jinpu' : {
            skillchain_a:SCISSION,skillchain_b:DETONATION,
        },
        'Tachi: Koki' : {
            skillchain_a:REVERBERATION,skillchain_b:IMPACTION,
        },
        'Tachi: Yukikaze' : {
            skillchain_a:INDURATION,skillchain_b:DETONATION,
        },
        'Tachi: Gekko' : {
            skillchain_a:DISTORTION,skillchain_b:REVERBERATION,
        },
        'Tachi: Kasha' : {
            skillchain_a:FUSION,skillchain_b:COMPRESSION,
        },
        'Tachi: Kaiten' : {
            skillchain_a:LIGHT,skillchain_b:FRAGMENTATION,
        },
        'Tachi: Rana' : {
            skillchain_a:GRAVITATION,skillchain_b:INDURATION,
        },
        'Tachi: Ageha' : {
            skillchain_a:COMPRESSION,skillchain_b:SCISSION,
        },
        'Tachi: Fudo' : {
            skillchain_a:LIGHT,skillchain_b:DISTORTION,
        },
        'Tachi: Shoha' : {
            skillchain_a:FRAGMENTATION,skillchain_b:COMPRESSION,
        },
        'Tachi: Mumei' : {
            skillchain_a:DETONATION,skillchain_b:COMPRESSION,skillchain_c:DISTORTION,
        }
    },
    "Club" : {
        'Shining Strike' : {
            skillchain_a:IMPACTION,
        },
        'Seraph Strike' : {
            skillchain_a:IMPACTION,
        },
        'Brainshaker' : {
            skillchain_a:REVERBERATION,
        },
        'Skullbreaker' : {
            skillchain_a:INDURATION,skillchain_b:REVERBERATION,
        },
        'True Strike' : {
            skillchain_a:DETONATION,skillchain_b:IMPACTION,
        },
        'Judgment' : {
            skillchain_a:IMPACTION,
        },
        'Hexa Strike' : {
            skillchain_a:FUSION,
        },
        'Black Halo' : {
            skillchain_a:FRAGMENTATION,skillchain_b:COMPRESSION,
        },
        'Randgrith' : {
            skillchain_a:LIGHT,skillchain_b:FRAGMENTATION,
        },
        'Flash Nova' : {
            skillchain_a:INDURATION,skillchain_b:REVERBERATION,
        },
        'Realmrazer' : {
            skillchain_a:FUSION,skillchain_b:IMPACTION,
        },
        'Exudation' : {
            skillchain_a:DARKNESS,skillchain_b:FRAGMENTATION,
        },
        'Dagda' : {
            skillchain_a:TRANSFIXION,skillchain_b:SCISSION,skillchain_c:GRAVITATION,
        }
    },
    "Staff" : {
        'Heavy Swing' : {
            skillchain_a:IMPACTION,
        },
        'Rock Crusher' : {
            skillchain_a:IMPACTION,
        },
        'Earth Crusher' : {
            skillchain_a:DETONATION,skillchain_b:IMPACTION,
        },
        'Starburst' : {
            skillchain_a:COMPRESSION,skillchain_b:REVERBERATION,
        },
        'Sunburst' : {
            skillchain_a:COMPRESSION,skillchain_b:REVERBERATION,
        },
        'Shell Crusher' : {
            skillchain_a:DETONATION,
        },
        'Full Swing' : {
            skillchain_a:LIQUEFACTION,skillchain_b:IMPACTION,
        },
        'Retribution' : {
            skillchain_a:GRAVITATION,skillchain_b:REVERBERATION,
        },
        'Gate of Tartarus' : {
            skillchain_a:DARKNESS,skillchain_b:DISTORTION,
        },
        'Vidohunir' : {
            skillchain_a:FRAGMENTATION,skillchain_b:DISTORTION,
        },
        'Garland of Bliss' : {
            skillchain_a:FUSION,skillchain_b:REVERBERATION,
        },
        'Omniscience' : {
            skillchain_a:GRAVITATION,skillchain_b:TRANSFIXION,
        },
        'Cataclysm' : {
            skillchain_a:COMPRESSION,skillchain_b:REVERBERATION,
        },
        'Shattersoul' : {
            skillchain_a:GRAVITATION,skillchain_b:INDURATION,
        },
        'Oshala' : {
            skillchain_a:INDURATION,skillchain_b:REVERBERATION,skillchain_c:FUSION,
        }
    },
    "Archery" : {
        'Flaming Arrow' : {
            skillchain_a:LIQUEFACTION,skillchain_b:TRANSFIXION,
        },
        'Piercing Arrow' : {
            skillchain_a:REVERBERATION,skillchain_b:TRANSFIXION,
        },
        'Dulling Arrow' : {
            skillchain_a:LIQUEFACTION,skillchain_b:TRANSFIXION,
        },
        'Sidewinder' : {
            skillchain_a:REVERBERATION,skillchain_b:TRANSFIXION,skillchain_c:DETONATION
        },
        'Blast Arrow' : {
            skillchain_a:INDURATION,skillchain_b:TRANSFIXION,
        },
        'Arching Arrow' : {
            skillchain_a:FUSION,
        },
        'Empyreal Arrow' : {
            skillchain_a:FUSION,skillchain_b:TRANSFIXION,
        },
        'Namas Arrow' : {
            skillchain_a:LIGHT,skillchain_b:DISTORTION,
        },
        'Refulgent Arrow' : {
            skillchain_a:REVERBERATION,skillchain_b:TRANSFIXION,
        },
        "Jishnu's Radiance" : {
            skillchain_a:LIGHT,skillchain_b:FUSION,
        },
        'Apex Arrow' : {
            skillchain_a:FRAGMENTATION,skillchain_b:TRANSFIXION,
        },
        'Sarv' : {
            skillchain_a:TRANSFIXION,skillchain_b:SCISSION,skillchain_c:GRAVITATION,
        }
    },
    "Marksmapship" : {
        'Hot Shot' : {
            skillchain_a:REVERBERATION,skillchain_b:TRANSFIXION,
        },
        'Split Shot' : {
            skillchain_a:REVERBERATION,skillchain_b:TRANSFIXION,
        },
        'Sniper Shot' : {
            skillchain_a:LIQUEFACTION,skillchain_b:TRANSFIXION,
        },
        'Slug Shot' : {
            skillchain_a:REVERBERATION,skillchain_b:TRANSFIXION,skillchain_c:DETONATION
        },
        'Blast Shot' : {
            skillchain_a:INDURATION,skillchain_b:TRANSFIXION,
        },
        'Heavy Shot' : {
            skillchain_a:FUSION,
        },
        'Detonator' : {
            skillchain_a:FUSION,skillchain_b:TRANSFIXION,
        },
        'Coronach' : {
            skillchain_a:DARKNESS,skillchain_b:FRAGMENTATION,
        },
        'Trueflight' : {
            skillchain_a:FRAGMENTATION,skillchain_b:SCISSION,
        },
        'Leaden Salute' : {
            skillchain_a:GRAVITATION,skillchain_b:TRANSFIXION,
        },
        'Numbing Shot' : {
            skillchain_a:INDURATION,skillchain_b:IMPACTION,skillchain_c:DETONATION
        },
        'Wildfire' : {
            skillchain_a:DARKNESS,skillchain_b:GRAVITATION,
        },
        'Last Stand' : {
            skillchain_a:FUSION,skillchain_b:REVERBERATION,
        },
        'Terminus' : {
            skillchain_a:INDURATION,skillchain_b:REVERBERATION,skillchain_c:FUSION,
        }
    },
    "Blue Magic" : {
        'Vertical Cleave' : {
            skillchain_a:GRAVITATION,
        },
        'Final Sting' : {
            skillchain_a:FUSION,
        },
        'Goblin Rush' : {
            skillchain_a:FUSION,skillchain_b:IMPACTION,
        },
        'Vanity Drive' : {
            skillchain_a:TRANSFIXION,skillchain_b:SCISSION,
        },
        'Whirl of Rage' : {
            skillchain_a:SCISSION,skillchain_b:DETONATION,
        },
        'Benthic Typhoon' : {
            skillchain_a:GRAVITATION,skillchain_b:TRANSFIXION,
        },
        'Quadratic Continuum' : {
            skillchain_a:DISTORTION,skillchain_b:SCISSION,
        },
        'Empty Thrash' : {
            skillchain_a:COMPRESSION,skillchain_b:SCISSION,
        },
        'Delta Thrust' : {
            skillchain_a:LIQUEFACTION,skillchain_b:DETONATION,
        },
        'Heavy Strike' : {
            skillchain_a:FRAGMENTATION,
        },
        'Sudden Lunge' : {
            skillchain_a:SCISSION,
        },
        'Quadrastrike' : {
            skillchain_a:LIQUEFACTION,skillchain_b:SCISSION,
        },
        'Amorphic Spikes' : {
            skillchain_a:GRAVITATION,
        },
        'Barbed Crescent' : {
            skillchain_a:DISTORTION,skillchain_b:LIQUEFACTION,
        },
        'Bloodrake' : {
            skillchain_a:DARKNESS,skillchain_b:GRAVITATION,
        }
    },
	"Summoner Blood Pact" : {
		'(Carbuncle) Poison Nails' : {
            skillchain_a:TRANSFIXION,
        },
		'(Fenrir) Moonlit Charge' : {
            skillchain_a:COMPRESSION,
        },
		'(Fenrir) Crescent Fang' : {
            skillchain_a:TRANSFIXION,
        },
		'(Fenrir) Eclipse Bite' : {
            skillchain_a:GRAVITATION,skillchain_b:SCISSION,
        },
		'(Ifrit) Punch' : {
            skillchain_a:LIQUEFACTION,
        },
		'(Ifrit) Burning Strike' : {
            skillchain_a:IMPACTION,
        },
		'(Ifrit) Double Punch' : {
            skillchain_a:COMPRESSION,
        },
		'(Ifrit) Flaming Crush' : {
            skillchain_a:FUSION,skillchain_b:REVERBERATION,
        },
		'(Titan) Rock Throw' : {
            skillchain_a:SCISSION,
        },
		'(Titan) Rock Buster' : {
            skillchain_a:REVERBERATION,
        },
		'(Titan) Megalith Throw' : {
            skillchain_a:INDURATION,
        },
		'(Titan) Mountain Buster' : {
            skillchain_a:GRAVITATION,skillchain_b:INDURATION,
        },
		'(Leviathan) Barracuda Dive' : {
            skillchain_a:REVERBERATION,
        },
		'(Leviathan) Tail Whip' : {
            skillchain_a:DETONATION,
        },
		'(Leviathan) Spinning Dive' : {
            skillchain_a:DISTORTION,skillchain_b:DETONATION,
        },
		'(Garuda) Claw' : {
            skillchain_a:DETONATION,
        },
		'(Garuda) Predator Claws' : {
            skillchain_a:FRAGMENTATION,skillchain_b:SCISSION,
        },
		'(Shiva) Axe Kick' : {
            skillchain_a:INDURATION,
        },
		'(Shiva) Double Slap' : {
            skillchain_a:SCISSION,
        },
		'(Shiva) Rush' : {
            skillchain_a:DISTORTION,skillchain_b:SCISSION,
        },
		'(Ramuh) Shock Strike' : {
            skillchain_a:IMPACTION,
        },
		'(Ramuh) Chaotic Strike' : {
            skillchain_a:FRAGMENTATION,skillchain_b:TRANSFIXION,
        },
		'(Diabolos) Camisado' : {
            skillchain_a:COMPRESSION,
        },
		'(Diabolos) Somnolence' : {
            skillchain_a:COMPRESSION,
        }
	},
    "Scholar Spell" : {
        'Light Element' : {
            skillchain_a:TRANSFIXION,
        },
        'Dark Element' : {
            skillchain_a:COMPRESSION,
        },
        'Fire Element' : {
            skillchain_a:LIQUEFACTION,
        },
        'Earth Element' : {
            skillchain_a:SCISSION,
        },
        'Water Element' : {
            skillchain_a:REVERBERATION,
        },
        'Wind Element' : {
            skillchain_a:DETONATION,
        },
        'Ice Element' : {
            skillchain_a:INDURATION,
        },
        'Thunder Element' : {
            skillchain_a:IMPACTION,
        }
    },
    "Automaton" : {
        '(Harlequin/Stormwaker) Slapstick | Thunder' : {
            skillchain_a:REVERBERATION,
            skillchain_b:IMPACTION,
        },
        '(Harlequin/Stormwaker) Knockout | Wind' : {
            skillchain_a:SCISSION,
            skillchain_b:DETONATION,
        },
        '(Harlequin/Stormwaker) Magic Mortar | Light' : {
            skillchain_a:LIQUEFACTION,
            skillchain_b:FUSION,
        },
        '(Valoredge) Chimera Ripper | Fire' : {
            skillchain_a:DETONATION,
            skillchain_b:INDURATION,
        },
        '(Valoredge) String Clipper | Thunder' : {
            skillchain_a:SCISSION,
        },
        '(Valoredge) Cannibal Blade | Dark' : {
            skillchain_a:COMPRESSION,
            skillchain_b:REVERBERATION,
        },
        '(Valoredge) Bone Crusher | Light' : {
            skillchain_a:FRAGMENTATION,
        },
        '(Valoredge) String Shredder | Thunder' : {
            skillchain_a:DISTORTION,
            skillchain_b:SCISSION,
        },
        '(Sharpshot) Arcuballista | Fire' : {
            skillchain_a:LIQUEFACTION,
            skillchain_b:TRANSFIXION,
        },
        '(Sharpshot) Daze | Thunder' : {
            skillchain_a:IMPACTION,
            skillchain_b:TRANSFIXION,
        },
        '(Sharpshot) Armor Piercer | Dark' : {
            skillchain_a:GRAVITATION,
        },
        '(Sharpshot) Armor Shatterer | Wind' : {
            skillchain_a:FUSION,
            skillchain_b:IMPACTION,
        },
    },
	"Beastmaster Pet" : {
		'(Pondering Peter) Foot Kick [1]' : {
            skillchain_a:REVERBERATION,
        },
		'(Pondering Peter) Whirl Claws [1]' : {
            skillchain_a:IMPACTION,
        },
		'(Aged Angus) Big Scissors [1]' : {
            skillchain_a:SCISSION,
        },
		'(Warlike Patrick) Tail Blow [1]' : {
            skillchain_a:IMPACTION,
        },
		'(Warlike Patrick) Blockhead [1]' : {
            skillchain_a:REVERBERATION,
        },
		'(Warlike Patrick) Brain Crush [1]' : {
            skillchain_a:LIQUEFACTION,
        },
		'(Bouncing Bertha) Sensilla Blades [1]' : {
            skillchain_a:SCISSION,
        },
		'(Bouncing Bertha) Tegmina Buffet [2]' : {
            skillchain_a:DISTORTION,skillchain_b:DETONATION,
        },
		'(Rhyming Shizuna) Lamb Chop [1]' : {
            skillchain_a:IMPACTION,
        },
		'(Rhyming Shizuna) Sheep Charge [1]' : {
            skillchain_a:REVERBERATION,
        },
		'(Swooping Zhivago) Swooping Frenzy [2]' : {
            skillchain_a:FUSION,skillchain_b:REVERBERATION,
        },
		'(Swooping Zhivago) Pentapeck [3]' : {
            skillchain_a:LIGHT,skillchain_b:DISTORTION,
        },
		'(Amiable Roche) Recoil Dive [1]' : {
            skillchain_a:TRANSFIXION,
        },
		'(Herald Henry) Big Scissors [1]' : {
            skillchain_a:SCISSION,
        },
		'(Brainy Waluis) Frogkick [1]' : {
            skillchain_a:COMPRESSION,
        },
		'(Suspicious Alice) Nimble Snap [1]' : {
            skillchain_a:IMPACTION,
        },
		'(Suspicious Alice) Cyclotail [1]' : {
            skillchain_a:IMPACTION,
        },
		'(Headbreaker Ken) Somersault [1]' : {
            skillchain_a:COMPRESSION,
        },
		'(Alluring Honey) Tickling Tendrils [1]' : {
            skillchain_a:IMPACTION,
        },
		'(Vivacious Vickie) Sweeping Gouge [1]' : {
            skillchain_a:INDURATION,
        },
		'(Anklebiter Jedd) Double Claw [1]' : {
            skillchain_a:LIQUEFACTION,
        },
		'(Anklebiter Jedd) Grapple [1]' : {
            skillchain_a:REVERBERATION,
        },
		'(Anklebiter Jedd) Spinning Top [1]' : {
            skillchain_a:IMPACTION,
        },
		'(Hurler Percival) Power Attack [1]' : {
            skillchain_a:REVERBERATION,
        },
		'(Hurler Percival) Rhino Attack [1]' : {
            skillchain_a:DETONATION,
        },
		'(Blackbeard Randy) Razor Fang [1]' : {
            skillchain_a:IMPACTION,
        },
		'(Blackbeard Randy) Claw Cyclone [1]' : {
            skillchain_a:SCISSION,
        },
    '(Blackbeard Randy) Crossthrash [2]' : {
            skillchain_a:DISTORTION,skillchain_b:DETONATION
        },  
		'(Fleet Reinhard) Scythe Tail [1]' : {
            skillchain_a:LIQUEFACTION,
        },
		'(Fleet Reinhard) Ripper Fang [1]' : {
            skillchain_a:INDURATION,
        },
		'(Fleet Reinhard) Chomp Rush [3]' : {
            skillchain_a:DARKNESS,skillchain_b:GRAVITATION,
        },
		'(Choral Leera) Pecking Flurry [1]' : {
            skillchain_a:TRANSFIXION,
        },
    '(Gussy Hacriobe) Sickle Slash [1]': {
            skillchain_a:TRANSFIXION
        },
    '(Creepy Annabelle) Mandibular Bite [1]': {
            skillchain_a:DETONATION
        },
		'(Submerged Iyo) Wing Slap [2]' : {
            skillchain_a:GRAVITATION,skillchain_b:LIQUEFACTION,
        },
		'(Submerged Iyo) Beak Lunge [1]' : {
            skillchain_a:SCISSION,
        },
		'(Threestar Lynn) Sudden Lunge [1]' : {
            skillchain_a:IMPACTION,
        },
		'(Threestar Lynn) Spiral Spin [1]' : {
            skillchain_a:SCISSION,
        },
		'(Sharpwit Hermes) Head Butt [1]' : {
            skillchain_a:DETONATION,
        },
		'(Sharpwit Hermes) Wild Oats [1]' : {
            skillchain_a:TRANSFIXION,
        },
		'(Sharpwit Hermes) Leaf Dagger [1]' : {
            skillchain_a:SCISSION,
        },
    '(Stalwart Angelina) Disembowel [1]' : {
            skillchain_a:IMPACTION
        },
		'(Stalwart Angelina) Extripating Salvo [2]' : {
            skillchain_a:FUSION,skillchain_b:IMPACTION,
        },
		'(Sweet Caroline) Head Butt [1]' : {
            skillchain_a:DETONATION,
        },
    '(Sweet Caroline) Wild Oats [1]' : {
            skillchain_a:TRANSFIXION,
        },
    '(Sweet Caroline) Leaf Dagger [1]' : {
            skillchain_a:SCISSION,
        },
		'(Jovial Edwin) Mega Scissors [2]' : {
            skillchain_a:GRAVITATION,skillchain_b:SCISSION,
        },
		'(Energized Sefina) Power Attack [1]' : {
            skillchain_a:REVERBERATION,
        },
    '(Energized Sefina) Rhino Attack [1]' : {
            skillchain_a:DETONATION,
        },
    '(Energized Sefina) Rhinowrecker [2]' : {
            skillchain_a:FUSION,skillchain_b:TRANSFIXION,
        },
		'(Daring Roland) Back Heel [1]' : {
            skillchain_a:REVERBERATION,
        },
    '(Daring Roland) Hoof Volley [3]' : {
            skillchain_a:LIGHT,skillchain_b:FRAGMENTATION,
        },
		'(Sultry Patrice) Fluid Toss [1]' : {
            skillchain_a:REVERBERATION,
        },
    '(Sultry Patrice) Fluid Spread [2]' : {
            skillchain_a:FRAGMENTATION,skillchain_b:TRANSFIXION,
        },
	},
    "Property" : {
        'Transfixion' : {
            skillchain_a:TRANSFIXION,
        },
        'Compression' : {
            skillchain_a:COMPRESSION,
        },
        'Liquefaction' : {
            skillchain_a:LIQUEFACTION,
        },
        'Scission' : {
            skillchain_a:SCISSION,
        },
        'Reverberation' : {
            skillchain_a:REVERBERATION,
        },
        'Detonation' : {
            skillchain_a:DETONATION,
        },
        'Induration' : {
            skillchain_a:INDURATION,
        },
        'Impaction' : {
            skillchain_a:IMPACTION,
        },
        'Gravitation' : {
            skillchain_a:GRAVITATION,
        },
        'Distortion' : {
            skillchain_a:DISTORTION,
        },
        'Fusion' : {
            skillchain_a:FUSION,
        },
        'Fragmentation' : {
            skillchain_a:FRAGMENTATION
        },
        'Light' : {
            skillchain_a:LIGHT
        },
        'Darkness' : {
            skillchain_a:DARKNESS
        }
    }
}

function clone(obj) {
    var copy;

    // Handle the 3 simple types, and null or undefined
    if (null == obj || "object" != typeof obj) return obj;

    // Handle Date
    if (obj instanceof Date) {
        copy = new Date();
        copy.setTime(obj.getTime());
        return copy;
    }

    // Handle Array
    if (obj instanceof Array) {
        copy = [];
        for (var i = 0, len = obj.length; i < len; i++) {
            copy[i] = clone(obj[i]);
        }
        return copy;
    }

    // Handle Object
    if (obj instanceof Object) {
        copy = {};
        for (var attr in obj) {
            if (obj.hasOwnProperty(attr)) copy[attr] = clone(obj[attr]);
        }
        return copy;
    }

    throw new Error("Unable to copy obj! Its type isn't supported.");
}