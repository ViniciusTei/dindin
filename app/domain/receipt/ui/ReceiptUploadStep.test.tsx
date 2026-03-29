import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { ReceiptUploadStep } from "./ReceiptUploadStep";

// Mock getUserMedia
const mockGetUserMedia = vi.fn();
Object.defineProperty(global.navigator, "mediaDevices", {
  value: { getUserMedia: mockGetUserMedia },
  writable: true,
  configurable: true,
});

describe("ReceiptUploadStep", () => {
  beforeEach(() => {
    mockGetUserMedia.mockReset();
  });

  it("renderiza o campo de arquivo e os botões no estado inicial", () => {
    render(<ReceiptUploadStep />);

    expect(screen.getByRole("button", { name: /tirar foto/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /extrair itens/i })).toBeInTheDocument();
  });

  it("exibe a mensagem de erro quando a prop error está definida", () => {
    render(<ReceiptUploadStep error="Imagem inválida." />);

    expect(screen.getByRole("alert")).toHaveTextContent("Imagem inválida.");
  });

  it("desabilita o botão de submit enquanto loading=true", () => {
    render(<ReceiptUploadStep loading />);

    expect(screen.getByRole("button", { name: /processando/i })).toBeDisabled();
  });

  it("exibe spinner de loading durante o processamento", () => {
    render(<ReceiptUploadStep loading />);

    expect(screen.getByText(/processando/i)).toBeInTheDocument();
  });

  it("desabilita o botão 'Tirar foto' enquanto loading=true", () => {
    render(<ReceiptUploadStep loading />);

    expect(screen.getByRole("button", { name: /tirar foto/i })).toBeDisabled();
  });

  it("mostra preview e botão 'Capturar foto' após câmera ativada", async () => {
    const mockStream = {
      getTracks: () => [{ stop: vi.fn() }],
    };
    mockGetUserMedia.mockResolvedValue(mockStream);

    render(<ReceiptUploadStep />);

    fireEvent.click(screen.getByRole("button", { name: /tirar foto/i }));

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /capturar foto/i })).toBeInTheDocument();
    });
  });

  it("mostra botão 'Cancelar' ao ativar câmera", async () => {
    const mockStream = { getTracks: () => [{ stop: vi.fn() }] };
    mockGetUserMedia.mockResolvedValue(mockStream);

    render(<ReceiptUploadStep />);
    fireEvent.click(screen.getByRole("button", { name: /tirar foto/i }));

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /cancelar/i })).toBeInTheDocument();
    });
  });

  it("volta ao estado inicial ao clicar em 'Cancelar'", async () => {
    const mockTrack = { stop: vi.fn() };
    const mockStream = { getTracks: () => [mockTrack] };
    mockGetUserMedia.mockResolvedValue(mockStream);

    render(<ReceiptUploadStep />);
    fireEvent.click(screen.getByRole("button", { name: /tirar foto/i }));

    await waitFor(() => screen.getByRole("button", { name: /cancelar/i }));

    fireEvent.click(screen.getByRole("button", { name: /cancelar/i }));

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /tirar foto/i })).toBeInTheDocument();
    });
    expect(mockTrack.stop).toHaveBeenCalled();
  });

  it("mostra erro da câmera quando getUserMedia é negado", async () => {
    mockGetUserMedia.mockRejectedValue(new Error("Permission denied"));

    render(<ReceiptUploadStep />);
    fireEvent.click(screen.getByRole("button", { name: /tirar foto/i }));

    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent(/câmera/i);
    });
  });

  it("desabilita 'Extrair itens' enquanto câmera está ativa", async () => {
    const mockStream = { getTracks: () => [{ stop: vi.fn() }] };
    mockGetUserMedia.mockResolvedValue(mockStream);

    render(<ReceiptUploadStep />);
    fireEvent.click(screen.getByRole("button", { name: /tirar foto/i }));

    await waitFor(() => screen.getByRole("button", { name: /capturar foto/i }));

    expect(screen.getByRole("button", { name: /extrair itens/i })).toBeDisabled();
  });
});
