import { Component } from '@angular/core';
import {Complex} from "./app.complex.type";

@Component({
  selector: 'app-root',
  templateUrl: 'app.complex.html',
  styleUrls: ['app.complex.css']
})

export class AppComplex {
  public complexes:Array<Complex> = [];
  public newComplexName:string = '';
  public editMode:boolean = false;
  private selectedComplex:Complex;

  public editComplex(complex:Complex):void {
    this.editMode = true;
    this.selectedComplex = complex;
    this.newComplexName = complex.name;
  }

  public removeComplex(index:number):void {
    this.complexes.splice(index, 1);
  }

  public addComplex():void {
    this.complexes.push({
      name: this.newComplexName
    });
  }

  public saveComplex():void {
    this.selectedComplex.name = this.newComplexName;
    this.editMode = false;
  }

  public cancelEdit():void {
    this.editMode = false;
    this.newComplexName = '';
  }

}
