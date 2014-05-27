//     Pump
//     (c) simonfan
//     Pump is licensed under the MIT terms.

define("pump",["require","exports","module","subject","lodash"],function(e,i,s){{var t=e("subject"),p=e("lodash");s.exports=t({initialize:function(e){this.pipes={},p.each(e,this.pipe,this)}})}});