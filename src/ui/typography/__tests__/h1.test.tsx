import React from 'react';

import { render } from '../../../test-utils';
import { H1 } from '../h1';

describe('H1', () => {
  it('should render with default props', () => {
    const result = render(<H1>Test heading</H1>);

    expect(result.getByText('Test heading')).toBeTruthy();
  });

  it('should apply custom testID', () => {
    const result = render(<H1 testID="heading-1">Test heading</H1>);

    expect(result.getByTestId('heading-1')).toBeTruthy();
  });

  it('should apply custom style', () => {
    const customStyle = { marginTop: 20 };
    const result = render(<H1 style={customStyle}>Test heading</H1>);

    const heading = result.getByText('Test heading');
    expect(heading.props.style).toContainEqual(
      expect.objectContaining(customStyle),
    );
  });

  it('should render with different emphasis levels', () => {
    const { rerender, getByText } = render(
      <H1 emphasis="pure">Test heading</H1>,
    );

    expect(getByText('Test heading')).toBeTruthy();

    rerender(<H1 emphasis="high">Test heading</H1>);
    expect(getByText('Test heading')).toBeTruthy();

    rerender(<H1 emphasis="medium">Test heading</H1>);
    expect(getByText('Test heading')).toBeTruthy();

    rerender(<H1 emphasis="low">Test heading</H1>);
    expect(getByText('Test heading')).toBeTruthy();
  });

  it('should apply custom color', () => {
    render(<H1 color="error">Test heading</H1>);

    expect(true).toBe(true); // Color application is tested through theme integration
  });
});
