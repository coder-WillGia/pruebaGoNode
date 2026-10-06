package matrix_processing

type NodeClientPort interface {
	AnalyzeMatrices(qr *QRResult, authToken string) (*NodeAnalysisData, error)
}

type RepositoryPort interface {
	SaveOperation(op *MatrixOperationHistory) (string, error)
	GetHistory(userID string, limit int) ([]MatrixOperationHistory, error)
}
