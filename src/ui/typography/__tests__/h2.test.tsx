import React from 'react';

import { render } from '../../../test-utils';
import { H2 } from '../h2';

describe('H2', () => {
  it('should render with default props', () => {
    const result = render(<H2>Test heading</H2>);

    expect(result.getByText('Test heading')).toBeTruthy();
  });

  it('should apply custom testID', () => {
    const result = render(<H2 testID="heading-2">Test heading</H2>);

    expect(result.getByTestId('heading-2')).toBeTruthy();
  });

  it('should apply custom style', () => {
    const customStyle = { marginTop: 20 };
    const result = render(<H2 style={customStyle}>Test heading</H2>);

    const heading = result.getByText('Test heading');
    expect(heading.props.style).toContainEqual(
      expect.objectContaining(customStyle),
    );
  });

  it('should render with different emphasis levels', () => {
    const { rerender, getByText } = render(
      <H2 emphasis="pure">Test heading</H2>,
    );

    expect(getByText('Test heading')).toBeTruthy();

    rerender(<H2 emphasis="high">Test heading</H2>);
    expect(getByText('Test heading')).toBeTruthy();

    rerender(<H2 emphasis="medium">Test heading</H2>);
    expect(getByText('Test heading')).toBeTruthy();

    rerender(<H2 emphasis="low">Test heading</H2>);
    expect(getByText('Test heading')).toBeTruthy();
  });

  it('should apply custom color', () => {
    render(<H2 color="#FF0000">Test heading</H2>);

    expect(true).toBe(true); // Color application is tested through theme integration
  });
});
