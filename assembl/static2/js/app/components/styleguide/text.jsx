import React from 'react';

class Text extends React.Component {
  render() {
    return (
      <div className="margin-xxl">
        <h2 className="dark-title-2 underline" id="text" style={{ borderBottom: "1px solid #ccc"}}>TEXT</h2>
        <section>
          <div className="title-section">
            <div className="title-hyphen"> </div>
            <h1 className="dark-title-1">Title section</h1>
          </div>
          <h3 className="collapsed-title margin-xl">
            <span>Title</span>
            <div className="inline right">
              <span className="assembl-icon-down-open color pointer" />
            </div>
          </h3>
          <h1 className="dark-title-1">Title 1</h1>
          <h2 className="dark-title-2">Title 2</h2>
          <h3 className="dark-title-3">Title 3</h3>
          <h4 className="dark-title-4">Title 4</h4>
          <h5 className="dark-title-5">Title 5</h5>
          <h3 className="ellipsis dark-title-3">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut volutpat interdum sem, eget malesuada tortor gravida volutpat. Donec luctus semper tincidunt. Sed vel iaculis libero, eu volutpat ante. Nullam lobortis suscipit lorem, a posuere erat vulputate sed. Integer varius purus diam, nec scelerisque urna vehicula et.
          </h3>
          <div className="ellipsis-content">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut volutpat interdum sem, eget malesuada tortor gravida volutpat. Donec luctus semper tincidunt. Sed vel iaculis libero, eu volutpat ante. Nullam lobortis suscipit lorem, a posuere erat vulputate sed. Integer varius purus diam, nec scelerisque urna vehicula et.
          </div>
          <div className="date margin-m">14 février 2017</div>
        </section>
        <section>
          <h3 className="dark-title-3">Code</h3>
          <pre>
            <div>&lt;div className="title-section"&gt;</div>
              <div style={{ marginLeft: `${20}px` }}>&lt;div className="title-hyphen"&gt;&nbsp;&lt;/div&gt;</div>
              <div style={{ marginLeft: `${20}px` }}>&lt;h1 className="dark-title-1"&gt;Title section&lt;/h1&gt;</div>
            <div>&lt;/div&gt;</div>
          </pre>
          <pre>
            <div>&lt;h3 className="collapsed-title"&gt;</div>
              <div style={{ marginLeft: `${20}px` }}>&lt;span&gt;Title&lt;/span&gt;</div>
              <div style={{ marginLeft: `${20}px` }}>&lt;div className="inline right"&gt;</div>
                <div style={{ marginLeft: `${40}px` }}>&lt;span className="assembl-icon-down-open color pointer" /&gt;</div>
              <div style={{ marginLeft: `${20}px` }}>&lt;/div&gt;</div>
            <div>&lt;/h3&gt;</div>
          </pre>
          <pre>
            &lt;h1 className="dark-title-1"&gt;Title 1&lt;/h1&gt;
          </pre>
          <pre>
            &lt;h2 className="dark-title-2"&gt;Title 2&lt;/h2&gt;
          </pre>
          <pre>
            &lt;h3 className="dark-title-3"&gt;Title 3&lt;/h3&gt;
          </pre>
          <pre>
            &lt;h4 className="dark-title-4"&gt;Title 4&lt;/h4&gt;
          </pre>
          <pre>
            &lt;h5 className="dark-title-5"&gt;Title 5&lt;/h5&gt;
          </pre>
          <pre>
            &lt;h1 className="light-title-1"&gt;Title 1&lt;/h1&gt;
          </pre>
          <pre>
            &lt;h2 className="light-title-2"&gt;Title 2&lt;/h2&gt;
          </pre>
          <pre>
            &lt;h3 className="light-title-3"&gt;Title 3&lt;/h3&gt;
          </pre>
          <pre>
            &lt;h4 className="light-title-4"&gt;Title 4&lt;/h4&gt;
          </pre>
          <pre>
            &lt;h5 className="light-title-5"&gt;Title 5&lt;/h5&gt;
          </pre>
          <pre>
            <div>&lt;h3 className="ellipsis dark-title-3"&gt;</div>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut volutpat interdum sem, eget malesuada tortor gravida volutpat. Donec luctus semper tincidunt. Sed vel iaculis libero, eu volutpat ante. Nullam lobortis suscipit lorem, a posuere erat vulputate sed. Integer varius purus diam, nec scelerisque urna vehicula et.
            <div>&lt;/h3&gt;</div>
          </pre>
          <pre>
            <div style={{ width: `${200}px` }}>&lt;div className="ellipsis-content"&gt;</div>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut volutpat interdum sem, eget malesuada tortor gravida volutpat. Donec luctus semper tincidunt. Sed vel iaculis libero, eu volutpat ante. Nullam lobortis suscipit lorem, a posuere erat vulputate sed. Integer varius purus diam, nec scelerisque urna vehicula et.
            <div>&lt;/div&gt;</div>
          </pre>
          <pre>
            &lt;div className="date"&gt;14 février 2017&lt;/div&gt;
          </pre>
        </section>
      </div>
    );
  }
}
export default Text;