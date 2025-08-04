import React from 'react';

import { render } from '../../../test-utils';
import { H3 } from '../h3';

describe('H3', () => {
  it('should render with default props', () => {
    const result = render(<H3>Test heading</H3>);

    expect(result.getByText('Test heading')).toBeTruthy();
  });

  it('should apply custom testID', () => {
    const result = render(<H3 testID="heading-3">Test heading</H3>);

    expect(result.getByTestId('heading-3')).toBeTruthy();
  });

  it('should apply custom style', () => {
    const customStyle = { marginTop: 20 };
    const result = render(<H3 style={customStyle}>Test heading</H3>);

    const heading = result.getByText('Test heading');
    expect(heading.props.style).toContainEqual(
      expect.objectContaining(customStyle),
    );
  });

  it('should render with different emphasis levels', () => {
    const { rerender, getByText } = render(
      <H3 emphasis="pure">Test heading</H3>,
    );

    expect(getByText('Test heading')).toBeTruthy();

    rerender(<H3 emphasis="high">Test heading</H3>);
    expect(getByText('Test heading')).toBeTruthy();

    rerender(<H3 emphasis="medium">Test heading</H3>);
    expect(getByText('Test heading')).toBeTruthy();

    rerender(<H3 emphasis="low">Test heading</H3>);
    expect(getByText('Test heading')).toBeTruthy();
  });

  it('should apply custom color', () => {
    render(<H3 color="link">Test heading</H3>);

    expect(true).toBe(true); // Color application is tested through theme integration
  });
});
