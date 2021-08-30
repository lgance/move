// import CryptoJS from 'crypto-js';
import * as CryptoJS from "crypto-js";
import "dotenv/config";
import axios from 'axios';


function getHeaderOption(origin:string,method?:string,consoleflags?:boolean){

  let space = " ";            // one space
  let newLine = "\n";            // new line
  let _method = method || "GET";            // method
  let _timestamp = new Date().getTime().toString();
  let _consoleflags = consoleflags || false;

  let url ="/"+origin.split('/').filter(function(item,index){
      return index>=3
  }).join('/');

if(consoleflags===false){
     console.log(`요청 url ${origin}`);
     console.log(`환경 ${process.env.ENV}`);
     console.log(url);        
}
console.log(`요청 url ${origin}`);
console.log(`환경 ${process.env.ENV}`);
console.log(url);        


// let hmac = CryptoJS.algo.HMAC.create(CryptoJS.algo.SHA256,"OHpjvlBdiJ385hWzkz0VzKcL3I6SHwLFKb6CHJQU");
let hmac = CryptoJS.algo.HMAC.create(CryptoJS.algo.SHA256, process.env.SECRETKEY!);
hmac.update(_method);
hmac.update(space);
hmac.update(url);   
hmac.update(newLine);
hmac.update(_timestamp);
hmac.update(newLine);
// hmac.update("ccKfd2GmdMIF99aPifvB");
hmac.update(process.env.ACCESSKEY!);

  let hash = hmac.finalize();

  const _signature =hash.toString(CryptoJS.enc.Base64);

  const headerOption = {
      // "x-ncp-iam-access-key":"ccKfd2GmdMIF99aPifvB",
      "x-ncp-iam-access-key":process.env.ACCESSKEY,
      "x-ncp-apigw-signature-v2":_signature,
      "x-ncp-apigw-timestamp":_timestamp,
      'Content-Type': 'application/json'
  }
  
  return {
      headerOption
  }
}

function Debug(errorObj:any,functionName:string){
  console.log(`${functionName}  : ${errorObj.message}`)
  let keys = Object.keys(errorObj);
  if(keys.includes('response')){
      let { request,response } = errorObj;
      console.log(request._header);

      console.log(`Status  : ${response.status} `);
      console.log(`Status Text : ${response.statusText}`);
      console.log(`Response Header >>`);
      console.log(response.headers);
      console.log(response.data);
  }
}


export class Server {
  private serverBaseAction:string = 'server/v2/';
  private serverVPCBaseAction:string = 'vserver/v2/';

  private url:string = 'https://ncloud.apigw.ntruss.com/';

  constructor(){
    this.initialize();
  }
  private initialize(){

  }
  public defaultCreateServerInstance = (imageProductList:any) =>{
    return new Promise(async(resolve,reject)=>{
      try {
        // imageProductList.forEach(async(item,index,arr)=>{
          //  let createIns = await this._createServerInstanceDefault(item.productCode,60520);
        // 
        // })
        let procName = imageProductList[0].productName;
        let procCode = imageProductList[0].productCode;

        console.log(procName);
        console.log(procCode);
        // await this._createServerInstanceDefault('SPSW0LINUX000146',60520)
        resolve(true);
      } catch (error) {
        console.error(error);
        reject(error);
      }
    })
  }

  public _createServerInstanceDefault = (serverImageProductCode:string,initScriptNo:any) =>{
    return new Promise(async(resolve,reject)=>{
      try {
        let serverAction = process.env.URL + this.serverBaseAction;
        let origin = serverAction + `createServerInstances?serverImageProductCode=${serverImageProductCode}&initScriptNo=${initScriptNo}&responseFormatType=json`;
  
        const { headerOption } = getHeaderOption(origin);
        let res = await axios.get(origin,{headers:headerOption});
  
        resolve(res);
  
      } catch (error) {
        reject(error.message);
  
      }
    })
  }
  public getImageType = (imgFilter?:string):Promise<[]> =>{
    return new Promise(async(resolve,reject)=>{
      try {
        let _imgFilter = imgFilter || 'ALL';
        let APPFilter = ['JENKINS','TENSORFLOW','RABBITMQ','PINPOINT','LAMP','WORDPRESS','MAGENTO','DRUPAL','JOOMLA!','SHADOWSOCKS',
      'LEMP','HUGO','GITLAB','NODE.JS','SUPERSET','TOMCAT','JEUS','WEBTOB','GRADLE'];
        let DBMSFilter = ['MYSQL','MSSQL','CUBRID','POSTGRESQL','MARIADB','REDIS','TIBERO'];
  
        // Beta Test OS Image Exception 
        let exceptionFilter = ['Ubuntu Server 16.04 with MySQL 5.6'];
  
        let allImage:any = await this._getServerImageProductList({array:true});
  
        let returnFilter = allImage.reduce((prev:any,curr:any)=>{
          // productName Uppercase
          let productNameUpper = curr.productName.toUpperCase();
              // img Filter Check contains is true
              const imgCheck = (filterName:string) => {
                let regex = new RegExp(filterName,'gi');
                return regex.test(productNameUpper);
              }
              if(exceptionFilter.includes(curr.productName)){
                console.log('Exception OS Image Filter ');
                console.log(curr.productName);
                return prev;
              }
              // Application Type 
              else if(_imgFilter ==='APP'){
                const result = APPFilter.some(imgCheck);
                if(!!result){
                  prev.push({
                   productName:curr.productName,
                   productCode:curr.productCode
                  });
                }
              }
              // DBMS Type
              else if(_imgFilter==='DBMS'){
                const result = DBMSFilter.some(imgCheck);
                if(!!result){
                  prev.push({
                    productName:curr.productName,
                    productCode:curr.productCode
                 
                  });
                }
              }
              // All Type ( Application + DBMS )
              else{
                const totalFilter = APPFilter.concat(DBMSFilter);
                const result = totalFilter.some(imgCheck);
                if(!!result){
                  prev.push({
                    productName:curr.productName,
                    productCode:curr.productCode
                  });
                }
              }
          return prev;
        },[])
         resolve(returnFilter);
  
      } catch (error) {
        Debug(error,"getOSImage");
        reject(error);
      }
    })
  }


  public _getServerProductList =(serverImageProductCode:string) =>{
    return new Promise(async(resolve,reject)=>{
      try {
        let serverAction = this.url + this.serverBaseAction;
        let origin = serverAction + `getServerProductList?serverImageProductCode=${serverImageProductCode}&responseFormatType=json`;
  
        const { headerOption } = getHeaderOption(origin);
        let res = await axios.get(origin,{headers:headerOption});
  
        resolve(res);
      } catch (error) {
        reject(error);
      }
    })
  }
/**
 * NCP Open API 
 * * 기본적인 open API
 * ? array : true 일경우 관련 responseData json 만 Array 로 반환 
 */
  public _getServerImageProductList = (param:any) =>{
    return new Promise(async(resolve,reject)=>{
      try {
          let { array }  = param;
          let serverAction = this.url + this.serverBaseAction;
          let origin = serverAction +`getServerImageProductList?responseFormatType=json`
          
          const { headerOption }  = getHeaderOption(origin);
  
          let res = await axios.get(origin,{headers:headerOption});

          if(array===true){
              let arrayRes = res.data.getServerImageProductListResponse.productList
              resolve(arrayRes);
          }else{
              resolve(res);
          }
      } catch (error) {
          reject(error);
      }
    })
  }


  public _createServerInstance =(serverImageProductCode:string,serverProductCode:string) =>{
    return new Promise(async(resolve,reject)=>{
      try {
        let serverAction = this.url + this.serverBaseAction;
        let origin = serverAction + `createServerInstances?serverImageProductCode=${serverImageProductCode}&serverProductCode=${serverProductCode}responseFormatType=json`;
        const { headerOption } = getHeaderOption(origin);
        let res = await axios.get(origin,{headers:headerOption});
  
        resolve(res);
  
      } catch (error) {
        reject(error);
      }
    })
  }

  public _getInitScriptList = () =>{
    return new Promise(async(resolve,reject)=>{
      try {
        let serverAction = this.url + this.serverBaseAction;
        let origin = serverAction + `getInitScriptList?responseFormatType=json`;
  
        const { headerOption } = getHeaderOption(origin);
        let res = await axios.get(origin,{headers:headerOption});
        
        let initScriptArray = res.data.getInitScriptListResponse.initScriptList;
        resolve(initScriptArray);
      } catch (error) {
        reject(error);
      }
    })
  }
}



export default new Server();
