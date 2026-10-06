package matrix_processing

type NodeClientPort interface {
	AnalyzeMatrices(qr *QRResult, authToken string) (*NodeAnalysisData, error)
}

type RepositoryPort interface {
	SaveOperation(op *MatrixOperationHistory) (string, error)
	GetHistory(limit int) ([]MatrixOperationHistory, error)
}
