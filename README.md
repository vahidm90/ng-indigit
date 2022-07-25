# NgIndigit

A very versatile Angular Digit Input Directive with customizable digit grouping, decimal separators, etc.

## Usage

In the terminal, type

```bash
$ npm install --save @vm-angular/ng-indigit
```

Now import the module in your angular module, e.g. ``app.module.ts``:

```ts
import { NgIndigitModule } from 'ng-indigit';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    NgIndigitModule
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
```

In your template file, add the ``ng-indigit`` attribute to an HTML text input, e.g.:

```html
<input type="text" ng-indigit formControlName="value"/>
```

## Configuration

You can use the following options with supported types for further customizations:

<table>
<thead>
<tr>
<th>Attribute</th>
<th>Supported Type</th>
<th>Default</th>
<th>Description</th>
</tr>
</thead>
<tbody>
<tr>
<td>
<code>integerDigitGroups</code>


<code>decimalDigitGroups</code><a href="#footnote-1" style="line-height: 0">[*]</a>
</td>
<td>
<ul>
<li><code style="color: #CC7832;">boolean</code><a href="#footnote-2" style="line-height: 0">[**]</a></li>
<li>Partial<<a href="docs/data-types.md#IDigitGroupParameter" target="_blank">IDigitGroupParameter</a>></li>
</ul>
</td>
<td>
<ul>
<li>if unset
<pre>
<span style="color: #CC7832;">false</span>
</pre>
</li>
<li>if set <code style="color: #CC7832;">true</code>
<pre>
{
  <span style="color: #9876AA;">groupSize</span>: <span style="color: #6897BB;">3</span>,
  <span style="color: #9876AA;">delimiter</span>: <span style="color: #6A8759;">' '</span>
}
// <b>you can override each property</b>
</pre>
</li>
</ul>
</td>
<td style="vertical-align: top;">
<b>Set digit grouping parameters for integer and decimal<a href="#footnote-1" style="line-height: 0">[*]</a> parts of a number.</b> 

You can set the __[delimiter character](docs/data-types.md#TDigitGroupDelimiter)__ and/or the __group size__.

### Note:

Setting `groupSize` to `0` will _disable_ digit grouping.
</td>
</tr>
<tr>
<td>
<code>decimal</code><a href="#footnote-1" style="line-height: 0">[*]</a>
</td>
<td>
<ul>
<li><code style="color: #CC7832;">boolean</code><a href="#footnote-2" style="line-height: 0">[**]</a></li>
<li>Partial<<a href="docs/data-types.md#IDecimalPartParameter" target="_blank">IDecimalPartParameter</a>></li>
</ul>
</td>
<td>
<ul>
<li>if unset
<pre>
<span style="color: #CC7832;">false</span>
</pre>
</li>
<li>if set <code style="color: #CC7832;">true</code>
<pre>
{
  <span style="color: #9876AA;">minDigitCount</span>: <span style="color: #6897BB;">0</span>,
  <span style="color: #9876AA;">maxDigitCount</span>: <span style="color: #6897BB;">-1</span>
}
// <b>you can override each property</b>
</pre>
</li>
</ul>
</td>
<td style="vertical-align: top;">
<b>Set parameters for decimal numbers<a href="#footnote-1" style="line-height: 0">[*]</a>.</b>

You can set the __[decimal separator](docs/data-types.md#TCustomFloatPoint) (float point character)__, and/or __
minimum/maximum number of decimal digits__.

### Note:

Setting `maxDigitCount` to `0` will _disable_ decimals.
</td>
</tr>
<tr>
<td>
<code style="line-height: 5">allowNegative</code>
</td>
<td>
<code style="color: #CC7832;">boolean</code><a href="#footnote-2" style="line-height: 0">[**]</a>
</td>
<td>
<code style="color: #CC7832;">false</code>
</td>
<td style="vertical-align: top;">
<b>Toggle support for negative numbers.</b>
</td>
</tr>
</tbody>
</table>

## Example/Demo

1. Clone the [GitHub repo](https://github.com/vahidm90/ng-indigit):

```bash
$ git clone git@github.com:vahidm90/ng-indigit.git
```

2. Install the dependencies/package contents:

```bash
$ cd ng-indigit
$ npm install
```

3. Build the directive:

```bash
$ ng build
```

4. Run the demo app

```bash
$ ng serve
```

5. Navigate to [http://localhost:4200](http://localhost:4200) on your browser to see a running demo.

## Contribution

Any pull request is welcome!

Here's a list of ideas to begin with:

* Automated tests
* Full support for decimal numbers
* Full support for negative numbers
* Compatibility tests on older/newer versions of Angular
* Make _Float Point_ and _Digit Group Delimiter_ characters fully flexible & customizable.

## Credits

Many thanks to [Javad Rasouli](https://github.com/JavadRasouli) for the idea to develop this in the first place, and
to [Hossein Salmanian](https://github.com/HosseinSalmanian) for valuable tips and feedbacks.

## License

NgIndigit is free and licensed under the [MIT License](./LICENSE).

## ________________________________

<span id="footnote-1" style="line-height: 0">_*_</span> Support for decimal numbers is experimental.

<span id="footnote-2" style="line-height: 0">**</span> For `boolean` properties passing only the _attribute name_ is
equivalent to `true`.
