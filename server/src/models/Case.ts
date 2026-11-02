import mongoose,{Schema} from 'mongoose';
const record=new Schema({},{_id:false,strict:false});
const CaseSchema=new Schema({status:{type:String,enum:['GENERATING','READY','FAILED','SOLVED'],required:true},premise:{type:String,required:true},publicCase:{type:record,required:true},solution:{type:record,required:true,select:false},evidence:{type:[record],required:true},result:{type:record,default:undefined},generationMetadata:{type:record,default:{}}},{timestamps:true,strict:true});
export const CaseModel=mongoose.models.MysteryCase||mongoose.model('MysteryCase',CaseSchema);
