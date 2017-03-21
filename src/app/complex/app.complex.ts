import {Component} from '@angular/core';
import {Complex} from './app.complex.type';
import {Http} from '@angular/http';
import {Config} from '../../config';

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

  constructor(private http:Http) {
    this.init();
  }

  public init():void {
    this.http.get(Config.API_URL + 'complexes').subscribe((data:any) => {
      this.complexes = data.json();
    });
  }

  public editComplex(complex:Complex):void {
    this.editMode = true;
    this.selectedComplex = complex;
    this.newComplexName = complex.complex;
  }

  public removeComplex(index:number):void {
    this.http.delete(Config.API_URL + 'complexes/' + this.complexes[index].id).subscribe(() => {
      this.complexes.splice(index, 1);
    });
  }

  public addComplex():void {
    this.http.post(Config.API_URL + 'complexes', {complex: this.newComplexName}).subscribe(() => {
      this.newComplexName = '';
      this.init();
    });
  }

  public saveComplex():void {
    const apiUrl = Config.API_URL + 'complexes/' + this.selectedComplex.id;
    this.http.put(apiUrl, {complex: this.newComplexName}).subscribe(() => {
      this.selectedComplex.complex = this.newComplexName;
      this.editMode = false;
    });
  }

  public cancelEdit():void {
    this.editMode = false;
    this.newComplexName = '';
  }

}
