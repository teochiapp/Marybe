import React, { useEffect } from 'react';
import { render, waitFor } from '@testing-library/react';
import { acquireDedupedRequest, isRequestCanceled } from './requestDedup';

function TestMount({ requestKey, executor, onDone }) {
  useEffect(() => {
    const request = acquireDedupedRequest(requestKey, executor);
    request.promise.then(onDone).catch(() => {});
    return () => request.release();
  }, [requestKey, executor, onDone]);
  return null;
}

describe('requestDedup', () => {
  test('deduplica el doble montaje de React.StrictMode sin abortar la petición activa', async () => {
    const signals = [];
    const executor = jest.fn((signal) => {
      signals.push(signal);
      return Promise.resolve('ok');
    });
    const onDone = jest.fn();

    render(
      <React.StrictMode>
        <TestMount requestKey="strict-mode-test" executor={executor} onDone={onDone} />
      </React.StrictMode>
    );

    await waitFor(() => expect(onDone).toHaveBeenCalledWith('ok'));
    expect(executor).toHaveBeenCalledTimes(1);
    expect(signals[0].aborted).toBe(false);
  });

  test('aborta la señal cuando el componente se desmonta de forma real antes de resolver', async () => {
    const signals = [];
    const executor = jest.fn(
      (signal) =>
        new Promise((resolve) => {
          signals.push(signal);
          signal.addEventListener('abort', () => resolve('aborted'));
        })
    );

    const { unmount } = render(<TestMount requestKey="real-unmount-test" executor={executor} onDone={jest.fn()} />);
    expect(signals[0].aborted).toBe(false);

    unmount();
    await waitFor(() => expect(signals[0].aborted).toBe(true));
  });

  test('el modo bypass crea una petición nueva y aborta inmediatamente al liberar', () => {
    const signals = [];
    const exec1 = jest.fn((signal) => {
      signals.push(signal);
      return new Promise(() => {});
    });
    const exec2 = jest.fn((signal) => {
      signals.push(signal);
      return new Promise(() => {});
    });

    const req1 = acquireDedupedRequest('bypass-key', exec1);
    const req2 = acquireDedupedRequest('bypass-key', exec2, { bypass: true });

    expect(exec1).toHaveBeenCalledTimes(1);
    expect(exec2).toHaveBeenCalledTimes(1);
    req2.release();
    expect(signals[1].aborted).toBe(true);
    expect(signals[0].aborted).toBe(false);
  });

  test('isRequestCanceled reconoce errores de cancelación de Axios y Fetch', () => {
    expect(isRequestCanceled({ code: 'ERR_CANCELED' })).toBe(true);
    expect(isRequestCanceled({ name: 'AbortError' })).toBe(true);
    expect(isRequestCanceled({ name: 'CanceledError' })).toBe(true);
    expect(isRequestCanceled(new Error('Network Error'))).toBe(false);
  });
});
