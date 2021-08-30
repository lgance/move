import e, * as express from 'express';
import Controller from '../interface/controller.interface'
import Server from '../utils/index';


interface IServer {
  [index:number]:string;
  serverName:string|String;
  serverProductCode:string;
  count:number;
  check:boolean;
}
class IndexController implements Controller {
  public path='/init-script';
  public router = express.Router();

  private allOSList:IServer[] = [];
  private notCheckedList:IServer[] = [];

  constructor(){
    this.initializeRoutes();
  }

  private initializeRoutes(){


    this.initializeServer();

    this.router.get(this.path,this.initScriptIndex);
    this.router.get(this.path+'/add',this.addInitScriptServer);
  }


  private addInitScriptServer = async(req:express.Request,res:express.Response)=>{

    let { osImageName } = req.query;
    let findOSName = osImageName;

    console.log(findOSName);

    let result = this.allOSList.some((item,index)=>{
      if(item.serverName===findOSName){
        item.count+=1;
        item.check=true;
        return true;
      }
      return false;
    });

    if(result===false){
      this.notCheckedList.push(Object.assign({},{serverName:findOSName,check:false,count:1,serverProductCode:'unknown'}))
      console.log('NOTCHECKED LIST ADD ');
    } 

    this.showCheckServer();

    res.send('All Check Server ');
  }
  private initScriptIndex = async (req:express.Request,res:express.Response)=>{
      res.send('initScriptIndex Index');
  }

  private showCheckServer = async () =>{

    let osStrOut='';
    let notCheckedOut='';

    console.log('------NOT CHECKED OS NAME LIST------');
    this.notCheckedList.forEach((item,index)=>{
      let ox = item.check === true ? "x" : " ";
      if((index+1)%4===0){
        notCheckedOut +=`${item.serverName} [${item.count}] [${ox}] \r\n`
      } 
      else{
        notCheckedOut +=`${item.serverName} [${item.count}] [${ox}]  \t\t\t`
      }
    });
    console.log(notCheckedOut);
    console.log('\r\n');

    console.log('------CONTAINS CHECKED OS NAME LIST------')
    this.allOSList.forEach((item,index)=>{
      let ox = item.check === true ? "x" : " ";
      if((index+1)%4===0){
        osStrOut +=`${item.serverName} [${item.count}] [${ox}] \r\n`
      } 
      else if(item.serverName.length<=21){
        osStrOut +=`${item.serverName} [${item.count}] [${ox}]  \t\t\t`
      }
      else if(item.serverName.length<=30){
        osStrOut +=`${item.serverName} [${item.count}] [${ox}]  \t\t`
      }
      else{
        osStrOut +=`${item.serverName} [${item.count}] [${ox}]  \t`
      }
    });

    console.log(osStrOut);
  }

  private initializeServer = async () =>{

    let array:any = await Server.getImageType();
    array.forEach((item:any,index:any)=>{

      this.allOSList.push(Object.assign({},
        {serverName:item.productName,
         serverProductCode:item.productCode,
         count:0,
         check:false
         }
       ))
    });

    // let testObj = {serverName:"Centos 7.3", count:0,check:false,serverProductCode:'ppap'};
    // let tabString  = new String(20);
    // for(let i=0;i<20;i++){
    //   if(i%2==0){
    //     tabString = "ppap";
    //     testObj.serverName=tabString.toString();
    //     testObj.check= false;
    //   }
    //   else{
    //     tabString = "Centos 7.3";
    //     testObj.serverName=tabString.toString();
    //     testObj.check = false;
    //   }
    //   this.allOSList.push(Object.assign({},testObj));
    // }

    this.allCreateServer(array);
    this.showCheckServer();
  }

  private allCreateServer = async (osImageList:[])=>{

    await Server.defaultCreateServerInstance(osImageList);
    
  }
}
export default IndexController;


