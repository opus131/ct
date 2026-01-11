import { createSignal, Show } from 'solid-js';
import type { Trade } from '../../data/types';
import {
  generateMemeFromPrompt,
  buildMemePromptForTrade,
  type MemeResult,
} from '../../lib/gemini/client';
import './meme-generator.css';

type Props = {
  trade: Trade;
};

export function MemeGenerator(props: Props) {
  const [isOpen, setIsOpen] = createSignal(false);
  const [meme, setMeme] = createSignal<MemeResult | null>(null);
  const [loading, setLoading] = createSignal(false);
  const [error, setError] = createSignal<string | null>(null);
  const [editedPrompt, setEditedPrompt] = createSignal('');
  const [editedCaption, setEditedCaption] = createSignal('');

  const initializePrompt = () => {
    const generatedPrompt = buildMemePromptForTrade(props.trade);
    setEditedPrompt(generatedPrompt.imagePrompt);
    setEditedCaption(generatedPrompt.caption);
  };

  const generateMeme = async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await generateMemeFromPrompt(
        props.trade.id,
        editedPrompt(),
        editedCaption()
      );
      setMeme(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate meme');
    } finally {
      setLoading(false);
    }
  };

  const regeneratePrompt = () => {
    setMeme(null);
    initializePrompt();
  };

  const openModal = () => {
    setIsOpen(true);
    setMeme(null);
    setError(null);
    initializePrompt();
  };

  const closeModal = () => {
    setIsOpen(false);
  };

  const handleBackdropClick = (e: MouseEvent) => {
    if (e.target === e.currentTarget) {
      closeModal();
    }
  };

  return (
    <>
      <button
        class="meme-btn"
        onClick={(e) => {
          e.stopPropagation();
          openModal();
        }}
        title="Generate Meme"
        aria-label="Generate a meme for this trade"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10" />
          <path d="M8 14s1.5 2 4 2 4-2 4-2" />
          <line x1="9" y1="9" x2="9.01" y2="9" />
          <line x1="15" y1="9" x2="15.01" y2="9" />
        </svg>
      </button>

      <Show when={isOpen()}>
        <div class="meme-modal-backdrop" onClick={handleBackdropClick}>
          <div class="meme-modal meme-modal--wide">
            <div class="meme-modal-header">
              <h3>Trade Meme Generator</h3>
              <button class="close-btn" onClick={closeModal} aria-label="Close">
                &times;
              </button>
            </div>
            <div class="meme-modal-content">
              <Show when={error()}>
                <div class="meme-error">
                  <p>{error()}</p>
                  <button onClick={() => { setError(null); }}>
                    Dismiss
                  </button>
                </div>
              </Show>

              <Show when={loading()}>
                <div class="meme-loading">
                  <div class="meme-spinner" />
                  <p>Generating your meme...</p>
                  <p class="meme-loading-sub">This may take a few seconds</p>
                </div>
              </Show>

              <Show when={!loading() && !meme()}>
                <div class="meme-prompt-editor">
                  <div class="prompt-field">
                    <label for="image-prompt">Image Prompt</label>
                    <textarea
                      id="image-prompt"
                      value={editedPrompt()}
                      onInput={(e) => setEditedPrompt(e.currentTarget.value)}
                      rows={8}
                      placeholder="Describe the image to generate..."
                    />
                  </div>
                  <div class="prompt-field">
                    <label for="caption">Caption</label>
                    <input
                      id="caption"
                      type="text"
                      value={editedCaption()}
                      onInput={(e) => setEditedCaption(e.currentTarget.value)}
                      placeholder="Meme caption..."
                    />
                  </div>
                  <div class="prompt-actions">
                    <button class="regenerate-btn" onClick={regeneratePrompt}>
                      Regenerate Prompt
                    </button>
                    <button
                      class="generate-btn"
                      onClick={generateMeme}
                      disabled={!editedPrompt().trim()}
                    >
                      Generate Meme
                    </button>
                  </div>
                </div>
              </Show>

              <Show when={meme() && !loading() && !error()}>
                <div class="meme-result">
                  <img
                    src={`data:image/png;base64,${meme()!.imageData}`}
                    alt="Generated meme"
                    class="meme-image"
                  />
                  <p class="meme-caption">{meme()!.caption}</p>
                  <div class="meme-actions">
                    <button
                      class="edit-btn"
                      onClick={() => setMeme(null)}
                    >
                      Edit Prompt
                    </button>
                    <button
                      class="download-btn"
                      onClick={() => {
                        const link = document.createElement('a');
                        link.href = `data:image/png;base64,${meme()!.imageData}`;
                        link.download = `trade-meme-${props.trade.id}.png`;
                        link.click();
                      }}
                    >
                      Download Meme
                    </button>
                  </div>
                </div>
              </Show>
            </div>
            <div class="meme-modal-footer">
              <span class="disclaimer">For entertainment purposes only</span>
            </div>
          </div>
        </div>
      </Show>
    </>
  );
}
