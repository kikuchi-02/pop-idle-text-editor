(window.webpackJsonp=window.webpackJsonp||[]).push([[3],{uJfP:function(a,e,n){"use strict";n.d(e,"a",function(){return b});var c=n("fXoL"),t=n("ofXK"),o=n("bSwM"),h=n("3Pt+");function i(a,e){if(1&a){const a=c.Tb();c.Qb(0),c.Sb(1,"label"),c.Sb(2,"mat-checkbox",1),c.Zb("ngModelChange",function(e){return c.qc(a),c.dc().checkboxChange(e,"nogizaka")}),c.zc(3,"\u4e43\u6728\u574246"),c.Rb(),c.Rb(),c.Sb(4,"label"),c.Sb(5,"mat-checkbox",1),c.Zb("ngModelChange",function(e){return c.qc(a),c.dc().checkboxChange(e,"sakurazaka")}),c.zc(6,"\u6afb\u574246"),c.Rb(),c.Rb(),c.Sb(7,"label"),c.Sb(8,"mat-checkbox",1),c.Zb("ngModelChange",function(e){return c.qc(a),c.dc().checkboxChange(e,"hinatazaka")}),c.zc(9,"\u65e5\u5411\u574246"),c.Rb(),c.Rb(),c.Pb()}if(2&a){const a=c.dc();c.Bb(2),c.jc("ngModel",a.value.nogizakaCheck),c.Bb(3),c.jc("ngModel",a.value.sakurazakaCheck),c.Bb(3),c.jc("ngModel",a.value.hinatazakaCheck)}}let b=(()=>{class a{constructor(){this.changed=new c.n}ngOnInit(){}checkboxChange(a,e){switch(e){case"nogizaka":this.value.nogizakaCheck=a;break;case"sakurazaka":this.value.sakurazakaCheck=a;break;case"hinatazaka":this.value.hinatazakaCheck=a}this.changed.next(this.value)}}return a.\u0275fac=function(e){return new(e||a)},a.\u0275cmp=c.Gb({type:a,selectors:[["app-idle-switcher"]],inputs:{value:"value"},outputs:{changed:"changed"},decls:1,vars:1,consts:[[4,"ngIf"],["color","primary",3,"ngModel","ngModelChange"]],template:function(a,e){1&a&&c.xc(0,i,10,3,"ng-container",0),2&a&&c.jc("ngIf",!!e.value)},directives:[t.l,o.a,h.n,h.q],styles:["label[_ngcontent-%COMP%]{padding-right:5px}"],changeDetection:0}),a})()}}]);